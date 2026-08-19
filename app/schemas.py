# pyrefly: ignore [missing-import]
from datetime import date, datetime
# pyrefly: ignore [missing-import]
from decimal import Decimal
# pyrefly: ignore [missing-import]
from typing import List, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, Field, model_validator


class DepartamentoBase(BaseModel):
    Nombre: str = Field(..., max_length=100, description="Nombre del departamento")
    Estado: bool = True


class DepartamentoCreate(DepartamentoBase):
    pass


class DepartamentoUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=100)
    Estado: Optional[bool] = None


class DepartamentoResponse(DepartamentoBase):
    ID_Departamento: int

    model_config = ConfigDict(from_attributes=True)


class UbicacionBase(BaseModel):
    Nombre: str = Field(..., max_length=100)
    Direccion: Optional[str] = Field(None, max_length=200)
    Estado: bool = True


class UbicacionCreate(UbicacionBase):
    pass


class UbicacionUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=100)
    Direccion: Optional[str] = Field(None, max_length=200)
    Estado: Optional[bool] = None


class UbicacionResponse(UbicacionBase):
    ID_Ubicacion: int

    model_config = ConfigDict(from_attributes=True)


class RolBase(BaseModel):
    Nombre_Rol: str = Field(..., max_length=50)
    Responsabilidades: Optional[str] = None
    Estado: bool = True


class RolCreate(RolBase):
    Permisos: Optional[List[int]] = Field(default_factory=list)


class RolUpdate(BaseModel):
    Nombre_Rol: Optional[str] = Field(None, max_length=50)
    Responsabilidades: Optional[str] = None
    Estado: Optional[bool] = None


class RolResponse(RolBase):
    ID_Rol: int
    Permisos: List["PermisoResponse"] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class PermisoBase(BaseModel):
    Nombre_Permiso: str = Field(..., max_length=100)
    Modulo: str = Field(..., max_length=50)
    Estado: bool = True


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(BaseModel):
    Nombre_Permiso: Optional[str] = Field(None, max_length=100)
    Modulo: Optional[str] = Field(None, max_length=50)
    Estado: Optional[bool] = None


class PermisoResponse(PermisoBase):
    ID_Permiso: int

    model_config = ConfigDict(from_attributes=True)


class TipoDeduccionBase(BaseModel):
    Nombre: str = Field(..., max_length=100)
    Es_Porcentaje: bool = False
    Valor_Referencia: Optional[Decimal] = None
    Obligatoria: bool = False
    Estado: bool = True


class TipoDeduccionCreate(TipoDeduccionBase):
    pass


class TipoDeduccionUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=100)
    Es_Porcentaje: Optional[bool] = None
    Valor_Referencia: Optional[Decimal] = None
    Obligatoria: Optional[bool] = None
    Estado: Optional[bool] = None


class TipoDeduccionResponse(TipoDeduccionBase):
    ID_TipoDeduccion: int

    model_config = ConfigDict(from_attributes=True)


class EmpleadoBase(BaseModel):
    Numero_Empleado: str = Field(..., max_length=20)
    Nombre: str = Field(..., max_length=150)
    Apellido: str = Field(..., max_length=150)
    INSS: str = Field(..., max_length=20)
    Fecha_Contratacion: date
    Salario_Base: Decimal = Field(..., gt=0)
    Dias_Vacaciones_Disponibles: Decimal = Field(default=Decimal("0.00"))
    ID_Departamento: int
    ID_Rol: int
    ID_Ubicacion: int
    Estado: bool = True
    Entra_ID: Optional[str] = None
    Pin_Acceso: Optional[str] = Field(None, max_length=10)


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    Numero_Empleado: Optional[str] = Field(None, max_length=20)
    Nombre: Optional[str] = Field(None, max_length=150)
    Apellido: Optional[str] = Field(None, max_length=150)
    INSS: Optional[str] = Field(None, max_length=20)
    Fecha_Contratacion: Optional[date] = None
    Salario_Base: Optional[Decimal] = Field(None, gt=0)
    Dias_Vacaciones_Disponibles: Optional[Decimal] = None
    ID_Departamento: Optional[int] = None
    ID_Rol: Optional[int] = None
    ID_Ubicacion: Optional[int] = None
    Estado: Optional[bool] = None
    Entra_ID: Optional[str] = None
    Pin_Acceso: Optional[str] = Field(None, max_length=10)


class EmpleadoResponse(EmpleadoBase):
    ID_Empleado: int

    model_config = ConfigDict(from_attributes=True)


class ContratoBase(BaseModel):
    ID_Empleado: int
    Tipo_Contrato: str = Field(..., max_length=50)
    Fecha_Inicio: date
    Fecha_Fin: Optional[date] = None
    Salario_Pactado: Decimal = Field(..., gt=0)
    Documento_Path: Optional[str] = Field(None, max_length=300)
    Estado: str = Field(default="Vigente", max_length=20)


class ContratoCreate(ContratoBase):
    pass


class ContratoUpdate(BaseModel):
    Tipo_Contrato: Optional[str] = Field(None, max_length=50)
    Fecha_Inicio: Optional[date] = None
    Fecha_Fin: Optional[date] = None
    Salario_Pactado: Optional[Decimal] = Field(None, gt=0)
    Documento_Path: Optional[str] = Field(None, max_length=300)
    Estado: Optional[str] = Field(None, max_length=20)


class ContratoResponse(ContratoBase):
    ID_Contrato: int

    model_config = ConfigDict(from_attributes=True)


class AsistenciaBase(BaseModel):
    ID_Empleado: int
    Fecha: date
    Hora_Entrada: Optional[str] = None
    Hora_Salida: Optional[str] = None
    ID_Ubicacion: Optional[int] = None
    IP_Marcaje: Optional[str] = Field(None, max_length=45)
    Horas_Trabajadas: Optional[Decimal] = None
    Estado: str = Field(default="Presente", max_length=20)


class AsistenciaCreate(AsistenciaBase):
    pass


class AsistenciaUpdate(BaseModel):
    Fecha: Optional[date] = None
    Hora_Entrada: Optional[str] = None
    Hora_Salida: Optional[str] = None
    ID_Ubicacion: Optional[int] = None
    IP_Marcaje: Optional[str] = Field(None, max_length=45)
    Horas_Trabajadas: Optional[Decimal] = None
    Estado: Optional[str] = Field(None, max_length=20)


class AsistenciaResponse(AsistenciaBase):
    ID_Asistencia: int

    model_config = ConfigDict(from_attributes=True)


class VacacionBase(BaseModel):
    ID_Empleado: int
    Fecha_Inicio: date
    Fecha_Fin: date
    Dias_Tomados: Decimal = Field(..., gt=0)
    Estado_Solicitud: str = Field(default="Aprobada", max_length=20)
    Observaciones: Optional[str] = Field(None, max_length=255)


class VacacionCreate(VacacionBase):
    pass


class VacacionUpdate(BaseModel):
    Fecha_Inicio: Optional[date] = None
    Fecha_Fin: Optional[date] = None
    Dias_Tomados: Optional[Decimal] = Field(None, gt=0)
    Estado_Solicitud: Optional[str] = Field(None, max_length=20)
    Observaciones: Optional[str] = Field(None, max_length=255)


class VacacionResponse(VacacionBase):
    ID_Vacacion: int

    model_config = ConfigDict(from_attributes=True)


class PlanillaDeduccionCreate(BaseModel):
    ID_TipoDeduccion: int
    Monto: Decimal = Field(..., gt=0)


class PlanillaCreate(BaseModel):
    ID_Empleado: int
    Mes: int
    Anio: int
    Quincena: Optional[int] = None
    Salario_Bruto: Decimal = Field(..., gt=0)
    Pago_Horas_Extras: Decimal = Field(default=Decimal("0.00"), ge=0)
    Ausencias_Deduccion: Decimal = Field(default=Decimal("0.00"), ge=0)
    Deducciones: Optional[List[PlanillaDeduccionCreate]] = Field(default_factory=list)


class PlanillaDeduccionResponse(PlanillaDeduccionCreate):
    ID_Planilla_Deduccion: int

    model_config = ConfigDict(from_attributes=True)


class PlanillaResponse(BaseModel):
    ID_Planilla: int
    ID_Empleado: int
    Mes: int
    Anio: int
    Quincena: Optional[int] = None
    Salario_Bruto: Decimal
    Pago_Horas_Extras: Decimal
    Ausencias_Deduccion: Decimal
    Total_Deducciones: Decimal
    Salario_Neto: Decimal
    Fecha_Generacion: Optional[datetime] = None
    Deducciones: List[PlanillaDeduccionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class BitacoraBase(BaseModel):
    ID_Empleado: Optional[int] = None
    Tabla_Afectada: str = Field(..., max_length=50)
    Accion: str = Field(..., max_length=20)
    Detalle: Optional[str] = Field(None, max_length=500)


class BitacoraCreate(BitacoraBase):
    pass


class BitacoraResponse(BitacoraBase):
    ID_Bitacora: int
    Fecha: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Módulo de Evaluación de Desempeño ---

class CategoriaEvaluacionBase(BaseModel):
    Nombre: str = Field(..., max_length=100, description="Nombre de la categoría de evaluación")
    Peso_Porcentaje: Decimal = Field(..., gt=0, le=100, description="Ponderación en porcentaje (ej: 20.00)")


class CategoriaEvaluacionCreate(CategoriaEvaluacionBase):
    pass


class CategoriaEvaluacionResponse(CategoriaEvaluacionBase):
    ID_Categoria: int

    model_config = ConfigDict(from_attributes=True)


class EvaluacionChecklistItemCreate(BaseModel):
    ID_Categoria: int = Field(..., description="ID de la categoría de evaluación")
    Puntaje: Decimal = Field(..., ge=0, le=100, description="Puntaje obtenido en esta categoría (0 a 100)")
    Observaciones: Optional[str] = Field(None, max_length=255, description="Observaciones específicas del ítem")


class EvaluacionChecklistResponse(BaseModel):
    ID_Checklist: int
    ID_Evaluacion: int
    ID_Categoria: int
    Puntaje: Decimal
    Observaciones: Optional[str] = None
    categoria: Optional[CategoriaEvaluacionResponse] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluacionCreate(BaseModel):
    ID_Empleado: int = Field(..., description="ID del empleado evaluado")
    ID_Evaluador: int = Field(..., description="ID del empleado evaluador")
    Fecha_Evaluacion: Optional[date] = Field(default_factory=date.today, description="Fecha de la evaluación")
    Periodo_Inicio: date = Field(..., description="Fecha de inicio del periodo a evaluar")
    Periodo_Fin: date = Field(..., description="Fecha de fin del periodo a evaluar")
    Comentarios_Generales: Optional[str] = Field(None, max_length=500, description="Comentarios generales de la evaluación")
    checklist: List[EvaluacionChecklistItemCreate] = Field(..., min_length=1, description="Array con los ítems del checklist")

    @model_validator(mode="after")
    def validar_periodo_semestral(self):
        if self.Periodo_Fin <= self.Periodo_Inicio:
            raise ValueError("La fecha de fin del periodo debe ser posterior a la fecha de inicio.")
        
        dias_diferencia = (self.Periodo_Fin - self.Periodo_Inicio).days
        if not (170 <= dias_diferencia <= 190):
            raise ValueError(
                f"El periodo de evaluación debe ser de aproximadamente 6 meses (semestral, 170-190 días). "
                f"Días del periodo proporcionado: {dias_diferencia}."
            )
        return self


class EvaluacionResponse(BaseModel):
    ID_Evaluacion: int
    ID_Empleado: int
    ID_Evaluador: int
    Fecha_Evaluacion: date
    Periodo_Inicio: date
    Periodo_Fin: date
    Puntuacion_Final: Decimal
    Comentarios_Generales: Optional[str] = None
    checklist_items: List[EvaluacionChecklistResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

