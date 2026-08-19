from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.database import get_db

class MarcajeRequest(BaseModel):
    tipo: str  # "entrada" | "salida"
    id_empleado: Optional[int] = None
    id_ubicacion: Optional[int] = None

router = APIRouter(prefix="/api/asistencia", tags=["Asistencia"])

def _enrich_asistencia(rec: models.Asistencia):
    emp_nombre = f"{rec.empleado.Nombre} {rec.empleado.Apellido}" if rec.empleado else "—"
    depto_nombre = rec.empleado.departamento.Nombre if (rec.empleado and rec.empleado.departamento) else "—"
    ubic_nombre = rec.ubicacion.Nombre if rec.ubicacion else (rec.empleado.ubicacion.Nombre if (rec.empleado and rec.empleado.ubicacion) else "—")

    return {
        "ID_Asistencia": rec.ID_Asistencia,
        "id_asistencia": rec.ID_Asistencia,
        "ID_Empleado": rec.ID_Empleado,
        "id_empleado": rec.ID_Empleado,
        "empleado": emp_nombre,
        "departamento": depto_nombre,
        "ubicacion": ubic_nombre,
        "Fecha": str(rec.Fecha),
        "fecha": str(rec.Fecha),
        "Hora_Entrada": str(rec.Hora_Entrada) if rec.Hora_Entrada else None,
        "hora_entrada": str(rec.Hora_Entrada) if rec.Hora_Entrada else None,
        "Hora_Salida": str(rec.Hora_Salida) if rec.Hora_Salida else None,
        "hora_salida": str(rec.Hora_Salida) if rec.Hora_Salida else None,
        "IP_Marcaje": rec.IP_Marcaje or "127.0.0.1",
        "ip_marcaje": rec.IP_Marcaje or "127.0.0.1",
        "Horas_Trabajadas": float(str(rec.Horas_Trabajadas)) if rec.Horas_Trabajadas else None,
        "horas_trabajadas": float(str(rec.Horas_Trabajadas)) if rec.Horas_Trabajadas else None,
        "Estado": rec.Estado or "Presente",
        "estado": rec.Estado or "Presente",
    }

@router.post("/marcar")
def marcar_asistencia(payload: MarcajeRequest, db: Session = Depends(get_db)):
    hoy = date.today()
    hora_actual = datetime.now().time()

    # Si no especifica empleado, tomar el primer empleado activo de la BD
    emp_id = payload.id_empleado
    if not emp_id:
        primer_emp = db.query(models.Empleado).filter(models.Empleado.Estado == True).first()
        if not primer_emp:
            raise HTTPException(status_code=400, detail="No hay empleados activos en el sistema")
        emp_id = primer_emp.ID_Empleado

    asistencia = (
        db.query(models.Asistencia)
        .filter(models.Asistencia.ID_Empleado == emp_id, models.Asistencia.Fecha == hoy)
        .first()
    )

    if not asistencia:
        asistencia = models.Asistencia(
            ID_Empleado=emp_id,
            Fecha=hoy,
            Hora_Entrada=hora_actual if payload.tipo == "entrada" else None,
            Hora_Salida=hora_actual if payload.tipo == "salida" else None,
            ID_Ubicacion=payload.id_ubicacion,
            IP_Marcaje="127.0.0.1",
            Estado="Presente"
        )
        db.add(asistencia)
    else:
        if payload.tipo == "entrada":
            asistencia.Hora_Entrada = hora_actual
        else:
            asistencia.Hora_Salida = hora_actual

    db.commit()
    db.refresh(asistencia)

    rec_db = (
        db.query(models.Asistencia)
        .options(joinedload(models.Asistencia.empleado).joinedload(models.Empleado.departamento), joinedload(models.Asistencia.ubicacion))
        .filter(models.Asistencia.ID_Asistencia == asistencia.ID_Asistencia)
        .first()
    )

    return {
        "estado": f"{payload.tipo.capitalize()} Registrada",
        "asistencia": _enrich_asistencia(rec_db or asistencia)
    }

@router.get("/historial")
def obtener_historial_asistencia(limit: int = 5, db: Session = Depends(get_db)):
    registros = (
        db.query(models.Asistencia)
        .options(joinedload(models.Asistencia.empleado).joinedload(models.Empleado.departamento), joinedload(models.Asistencia.ubicacion))
        .order_by(models.Asistencia.Fecha.desc(), models.Asistencia.ID_Asistencia.desc())
        .limit(limit)
        .all()
    )
    return [_enrich_asistencia(r) for r in registros]

@router.post("/", response_model=schemas.AsistenciaResponse, status_code=201)
def crear_asistencia(asistencia: schemas.AsistenciaCreate, db: Session = Depends(get_db)):
    if not db.get(models.Empleado, asistencia.ID_Empleado):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    if asistencia.ID_Ubicacion and not db.get(models.Ubicacion, asistencia.ID_Ubicacion):
        raise HTTPException(status_code=404, detail="Ubicacion no encontrada")
    nuevo_registro = models.Asistencia(**asistencia.model_dump())
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@router.get("/")
def obtener_asistencias(
    id_empleado: Optional[int] = None,
    fecha: Optional[str] = None,
    departamento: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(models.Asistencia)
        .options(
            joinedload(models.Asistencia.empleado).joinedload(models.Empleado.departamento),
            joinedload(models.Asistencia.ubicacion)
        )
    )
    if id_empleado is not None:
        query = query.filter(models.Asistencia.ID_Empleado == id_empleado)
    if fecha:
        query = query.filter(models.Asistencia.Fecha == fecha)
    
    registros = query.all()
    if departamento:
        registros = [r for r in registros if r.empleado and r.empleado.departamento and str(r.empleado.ID_Departamento) == departamento]

    return [_enrich_asistencia(r) for r in registros]

@router.get("/{asistencia_id}")
def obtener_asistencia(asistencia_id: int, db: Session = Depends(get_db)):
    asistencia = (
        db.query(models.Asistencia)
        .options(
            joinedload(models.Asistencia.empleado).joinedload(models.Empleado.departamento),
            joinedload(models.Asistencia.ubicacion)
        )
        .filter(models.Asistencia.ID_Asistencia == asistencia_id)
        .first()
    )
    if not asistencia:
        raise HTTPException(status_code=404, detail="Registro de asistencia no encontrado")
    return _enrich_asistencia(asistencia)
