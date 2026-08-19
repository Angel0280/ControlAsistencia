"""
Modulo de Evaluacion de Desempeno - Router FastAPI

Este modulo gestiona los endpoints para la Evaluacion de Desempeno de los empleados,
incluyendo el registro de evaluaciones semestrales con checklist ponderado,
la asignacion automatica del puntaje final y la consulta del historial por empleado.
"""

from decimal import Decimal
from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/evaluaciones",
    tags=["Evaluaciones de Desempeño"],
)


CATEGORIAS_DEFECTO = [
    {"Nombre": "Rendimiento", "Peso_Porcentaje": Decimal("20.00")},
    {"Nombre": "Objetivos", "Peso_Porcentaje": Decimal("20.00")},
    {"Nombre": "Responsabilidad", "Peso_Porcentaje": Decimal("15.00")},
    {"Nombre": "Competencias", "Peso_Porcentaje": Decimal("15.00")},
    {"Nombre": "Aptitudes", "Peso_Porcentaje": Decimal("10.00")},
    {"Nombre": "Iniciativa", "Peso_Porcentaje": Decimal("10.00")},
    {"Nombre": "Creatividad", "Peso_Porcentaje": Decimal("10.00")},
]


@router.get(
    "/categorias",
    response_model=List[schemas.CategoriaEvaluacionResponse],
    summary="Obtener categorías de evaluación",
    description="Retorna el listado de categorías registradas con sus respectivos pesos porcentuales.",
)
def obtener_categorias(db: Session = Depends(get_db)):
    """
    Retorna la lista de todas las categorías de evaluación de desempeño.
    """
    return db.query(models.CategoriaEvaluacion).all()


@router.post(
    "/categorias/sembrar",
    response_model=List[schemas.CategoriaEvaluacionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Sembrar categorías por defecto",
    description="Inicializa las 7 categorías requeridas (Rendimiento, Objetivos, Responsabilidad, Competencias, Aptitudes, Iniciativa, Creatividad) si la tabla está vacía.",
)
def sembrar_categorias_defecto(db: Session = Depends(get_db)):
    """
    Siembra las categorías de evaluación estándar con sus ponderaciones semestrales.
    """
    categorias_existentes = db.query(models.CategoriaEvaluacion).count()
    if categorias_existentes > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existen categorías registradas en la base de datos.",
        )

    nuevas_categorias = [
        models.CategoriaEvaluacion(**cat) for cat in CATEGORIAS_DEFECTO
    ]
    try:
        db.add_all(nuevas_categorias)
        db.commit()
        for cat in nuevas_categorias:
            db.refresh(cat)
        return nuevas_categorias
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al sembrar las categorías: {str(exc)}",
        )


@router.post(
    "/",
    response_model=schemas.EvaluacionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nueva evaluación de desempeño",
    description="Crea una evaluación semestral registrando el checklist y calculando automáticamente la Puntuación Final basada en las ponderaciones.",
)
def registrar_evaluacion(
    evaluacion_in: schemas.EvaluacionCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una evaluación de desempeño completa.

    - **Validaciones**:
      1. Período semestral de 6 meses (validado en esquema Pydantic).
      2. Existencia del empleado evaluado (`ID_Empleado`).
      3. Existencia del evaluador (`ID_Evaluador`).
      4. Validez de las categorías especificadas en el checklist.

    - **Cálculo Automático**:
      Multiplica el `Puntaje` de cada ítem por el `Peso_Porcentaje` de su categoría
      para calcular la `Puntuacion_Final`.

    - **Transaccionalidad**:
      Garantiza atomicidad con `commit` y `rollback` en bloque `try-except`.
    """
    # 1. Verificar existencia de Empleado Evaluado
    empleado = db.get(models.Empleado, evaluacion_in.ID_Empleado)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El empleado evaluado con ID {evaluacion_in.ID_Empleado} no existe.",
        )

    # 2. Verificar existencia de Empleado Evaluador
    evaluador = db.get(models.Empleado, evaluacion_in.ID_Evaluador)
    if not evaluador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El evaluador con ID {evaluacion_in.ID_Evaluador} no existe.",
        )

    # 3. Cargar las categorías invocadas para validar y obtener sus ponderaciones
    categoria_ids = {item.ID_Categoria for item in evaluacion_in.checklist}
    categorias_db = (
        db.query(models.CategoriaEvaluacion)
        .filter(models.CategoriaEvaluacion.ID_Categoria.in_(categoria_ids))
        .all()
    )
    categorias_map = {c.ID_Categoria: c for c in categorias_db}

    # Validar si falta alguna categoría
    categoria_ids_faltantes = categoria_ids - set(categorias_map.keys())
    if categoria_ids_faltantes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Las siguientes categorías con ID no existen: {list(categoria_ids_faltantes)}",
        )

    # 4. Calcular Puntuacion_Final ponderada
    # Fórmula: Suma(Puntaje_item * (Peso_Porcentaje / 100))
    puntuacion_acumulada = Decimal("0.00")
    items_checklist_db = []

    for item in evaluacion_in.checklist:
        cat_db = categorias_map[item.ID_Categoria]
        peso = cat_db.Peso_Porcentaje

        # Convertir peso a fracción decimal si viene en escala 0-100%
        factor_peso = (peso / Decimal("100.0")) if peso > Decimal("1.0") else peso
        contribucion = item.Puntaje * factor_peso
        puntuacion_acumulada += contribucion

        items_checklist_db.append(
            models.EvaluacionChecklist(
                ID_Categoria=item.ID_Categoria,
                Puntaje=item.Puntaje,
                Observaciones=item.Observaciones,
            )
        )

    puntuacion_final = round(puntuacion_acumulada, 2)

    # 5. Guardar en Base de Datos con Manejo Estricto de Transacción
    nueva_evaluacion = models.Evaluacion(
        ID_Empleado=evaluacion_in.ID_Empleado,
        ID_Evaluador=evaluacion_in.ID_Evaluador,
        Fecha_Evaluacion=evaluacion_in.Fecha_Evaluacion or date.today(),
        Periodo_Inicio=evaluacion_in.Periodo_Inicio,
        Periodo_Fin=evaluacion_in.Periodo_Fin,
        Puntuacion_Final=puntuacion_final,
        Comentarios_Generales=evaluacion_in.Comentarios_Generales,
        checklist_items=items_checklist_db,
    )

    try:
        db.add(nueva_evaluacion)
        db.commit()
        db.refresh(nueva_evaluacion)
        return nueva_evaluacion
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en la transacción al registrar la evaluación: {str(exc)}",
        )


@router.get(
    "/empleado/{id_empleado}",
    response_model=List[schemas.EvaluacionResponse],
    summary="Obtener historial de evaluaciones de un empleado",
    description="Retorna el historial completo de evaluaciones de desempeño registradas para el empleado especificado.",
)
def obtener_historial_empleado(
    id_empleado: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene todas las evaluaciones registradas para un empleado determinado.
    """
    empleado = db.get(models.Empleado, id_empleado)
    if not empleado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El empleado con ID {id_empleado} no existe.",
        )

    evaluaciones = (
        db.query(models.Evaluacion)
        .options(
            joinedload(models.Evaluacion.checklist_items).joinedload(
                models.EvaluacionChecklist.categoria
            )
        )
        .filter(models.Evaluacion.ID_Empleado == id_empleado)
        .order_by(models.Evaluacion.Fecha_Evaluacion.desc())
        .all()
    )

    return evaluaciones
