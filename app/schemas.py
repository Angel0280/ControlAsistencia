# pyrefly: ignore [missing-import]
from datetime import date, datetime
# pyrefly: ignore [missing-import]
from decimal import Decimal
# pyrefly: ignore [missing-import]
from typing import List, Optional
# pyrefly: ignore [missing-import]
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_validator


# --- Permisos (definido antes de Rol para evitar forward references) ---
class PermisoBase(BaseModel):
    Nombre_Permiso: str = Field(..., max_length=100)
    Modulo: str = Field(..., max_length=50)
    Estado: Optional[bool] = True


class PermisoCreate(PermisoBase):
    pass


class PermisoUpdate(BaseModel):
    Nombre_Permiso: Optional[str] = Field(None, max_length=100)
    Modulo: Optional[str] = Field(None, max_length=50)
    Estado: Optional[bool] = None


class PermisoResponse(PermisoBase):
    ID_Permiso: int

    model_config = ConfigDict(from_attributes=True)


# --- Departamentos ---
class DepartamentoBase(BaseModel):
    Nombre: str = Field(..., max_length=100, description="Nombre del departamento")
    Estado: Optional[bool] = True


class DepartamentoCreate(DepartamentoBase):
    pass


class DepartamentoUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=100)
    Estado: Optional[bool] = None


class DepartamentoResponse(DepartamentoBase):
    ID_Departamento: int

    model_config = ConfigDict(from_attributes=True)


# --- Ubicaciones ---
class UbicacionBase(BaseModel):
    Nombre: str = Field(..., max_length=100)
    Direccion: Optional[str] = Field(None, max_length=200)
    Estado: Optional[bool] = True


class UbicacionCreate(UbicacionBase):
    pass


class UbicacionUpdate(BaseModel):
    Nombre: Optional[str] = Field(None, max_length=100)
    Direccion: Optional[str] = Field(None, max_length=200)
    Estado: Optional[bool] = None


class UbicacionResponse(UbicacionBase):
    ID_Ubicacion: int

    model_config = ConfigDict(from_attributes=True)


# --- Roles ---
class RolBase(BaseModel):
    Nombre_Rol: str = Field(..., max_length=50)
    Responsabilidades: Optional[str] = None
    Estado: Optional[bool] = True


class RolCreate(RolBase):
    Permisos: Optional[List[int]] = Field(default_factory=list)


class RolUpdate(BaseModel):
    Nombre_Rol: Optional[str] = Field(None, max_length=50)
    Responsabilidades: Optional[str] = None
    Estado: Optional[bool] = None


class RolResponse(RolBase):
    ID_Rol: int
    Permisos: List[PermisoResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Tipos Deducción ---
class TipoDeduccionBase(BaseModel):
    Nombre: str = Field(..., max_length=100)
    Es_Porcentaje: Optional[bool] = False
    Valor_Referencia: Optional[Decimal] = None
    Obligatoria: Optional[bool] = False
    Estado: Optional[bool] = True


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


# --- Catalogos ---
class CatalogosResponse(BaseModel):
    departamentos: List[DepartamentoResponse]
    roles: List[RolResponse]
    ubicaciones: List[UbicacionResponse]


# --- Empleados ---
class EmpleadoBase(BaseModel):
    Numero_Empleado: str = Field(..., max_length=20, validation_alias=AliasChoices("Numero_Empleado", "numero_empleado"))
    Nombre: str = Field(..., max_length=150, validation_alias=AliasChoices("Nombre", "nombre"))
    Apellido: str = Field(..., max_length=150, validation_alias=AliasChoices("Apellido", "apellido"))
    INSS: str = Field(..., max_length=20, validation_alias=AliasChoices("INSS", "inss"))
    Fecha_Contratacion: date = Field(..., validation_alias=AliasChoices("Fecha_Contratacion", "fecha_contratacion"))
    Dias_Vacaciones_Disponibles: Optional[Decimal] = Field(default=Decimal("0.00"), validation_alias=AliasChoices("Dias_Vacaciones_Disponibles", "dias_vacaciones_disponibles"))
    Salario_Base: Decimal = Field(..., validation_alias=AliasChoices("Salario_Base", "salario_base"))
    ID_Departamento: int = Field(..., validation_alias=AliasChoices("ID_Departamento", "id_departamento"))
    ID_Rol: int = Field(..., validation_alias=AliasChoices("ID_Rol", "id_rol"))
    ID_Ubicacion: int = Field(..., validation_alias=AliasChoices("ID_Ubicacion", "id_ubicacion"))
    Estado: Optional[bool] = Field(default=True, validation_alias=AliasChoices("Estado", "estado"))
    Entra_ID: Optional[str] = Field(None, validation_alias=AliasChoices("Entra_ID", "entra_id"))
    Pin_Acceso: Optional[str] = Field(None, max_length=10, validation_alias=AliasChoices("Pin_Acceso", "pin_acceso"))


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    Numero_Empleado: Optional[str] = Field(None, max_length=20, validation_alias=AliasChoices("Numero_Empleado", "numero_empleado"))
    Nombre: Optional[str] = Field(None, max_length=150, validation_alias=AliasChoices("Nombre", "nombre"))
    Apellido: Optional[str] = Field(None, max_length=150, validation_alias=AliasChoices("Apellido", "apellido"))
    INSS: Optional[str] = Field(None, max_length=20, validation_alias=AliasChoices("INSS", "inss"))
    Fecha_Contratacion: Optional[date] = Field(None, validation_alias=AliasChoices("Fecha_Contratacion", "fecha_contratacion"))
    Dias_Vacaciones_Disponibles: Optional[Decimal] = Field(None, validation_alias=AliasChoices("Dias_Vacaciones_Disponibles", "dias_vacaciones_disponibles"))
    Salario_Base: Optional[Decimal] = Field(None, validation_alias=AliasChoices("Salario_Base", "salario_base"))
    ID_Departamento: Optional[int] = Field(None, validation_alias=AliasChoices("ID_Departamento", "id_departamento"))
    ID_Rol: Optional[int] = Field(None, validation_alias=AliasChoices("ID_Rol", "id_rol"))
    ID_Ubicacion: Optional[int] = Field(None, validation_alias=AliasChoices("ID_Ubicacion", "id_ubicacion"))
    Estado: Optional[bool] = Field(None, validation_alias=AliasChoices("Estado", "estado"))
    Entra_ID: Optional[str] = Field(None, validation_alias=AliasChoices("Entra_ID", "entra_id"))
    Pin_Acceso: Optional[str] = Field(None, max_length=10, validation_alias=AliasChoices("Pin_Acceso", "pin_acceso"))


class EmpleadoEstadoUpdate(BaseModel):
    estado: int = Field(..., description="1 para activo, 0 para inactivo")


class EmpleadoResponse(EmpleadoBase):
    ID_Empleado: int
    id_empleado: Optional[int] = None
    numero_empleado: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    inss: Optional[str] = None
    fecha_contratacion: Optional[date] = None
    salario_base: Optional[Decimal] = None
    id_departamento: Optional[int] = None
    id_rol: Optional[int] = None
    id_ubicacion: Optional[int] = None
    estado: Optional[bool] = None
    departamento: Optional[str] = None
    rol: Optional[str] = None
    ubicacion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# --- Contratos ---
class ContratoBase(BaseModel):
    ID_Empleado: int
    Tipo_Contrato: str = Field(..., max_length=50)
    Fecha_Inicio: date
    Fecha_Fin: Optional[date] = None
    Documento_Path: Optional[str] = Field(None, max_length=300)
    Estado: Optional[str] = Field(default="Vigente", max_length=20)


class ContratoCreate(ContratoBase):
    pass


class ContratoUpdate(BaseModel):
    Tipo_Contrato: Optional[str] = Field(None, max_length=50)
    Fecha_Inicio: Optional[date] = None
    Fecha_Fin: Optional[date] = None
    Documento_Path: Optional[str] = Field(None, max_length=300)
    Estado: Optional[str] = Field(None, max_length=20)


class ContratoResponse(ContratoBase):
    ID_Contrato: int

    model_config = ConfigDict(from_attributes=True)


# --- Asistencia ---
class AsistenciaBase(BaseModel):
    ID_Empleado: int
    Fecha: date
    Hora_Entrada: Optional[str] = None
    Hora_Salida: Optional[str] = None
    ID_Ubicacion: Optional[int] = None
    IP_Marcaje: Optional[str] = Field(None, max_length=45)
    Horas_Trabajadas: Optional[Decimal] = None
    Estado: Optional[str] = Field(default="Presente", max_length=20)


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


# --- Vacaciones ---
class VacacionBase(BaseModel):
    ID_Empleado: int
    Fecha_Inicio: date
    Fecha_Fin: date
    Estado_Solicitud: Optional[str] = Field(default="Aprobada", max_length=20)
    Observaciones: Optional[str] = Field(None, max_length=255)


class VacacionCreate(VacacionBase):
    pass


class VacacionUpdate(BaseModel):
    Fecha_Inicio: Optional[date] = None
    Fecha_Fin: Optional[date] = None
    Estado_Solicitud: Optional[str] = Field(None, max_length=20)
    Observaciones: Optional[str] = Field(None, max_length=255)


class VacacionResponse(VacacionBase):
    ID_Vacacion: int

    model_config = ConfigDict(from_attributes=True)


# --- Planilla ---
class PlanillaDeduccionCreate(BaseModel):
    ID_TipoDeduccion: int
    Monto: Decimal = Field(..., gt=Decimal("0"))


class PlanillaCreate(BaseModel):
    ID_Empleado: int
    Mes: int
    Anio: int
    Quincena: Optional[int] = None
    Salario_Bruto: Decimal = Field(..., gt=Decimal("0"))
    Pago_Horas_Extras: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0"))
    Ausencias_Deduccion: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0"))
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
    Pago_Horas_Extras: Optional[Decimal] = Decimal("0.00")
    Ausencias_Deduccion: Optional[Decimal] = Decimal("0.00")
    Total_Deducciones: Optional[Decimal] = Decimal("0.00")
    Salario_Neto: Decimal
    Fecha_Generacion: Optional[datetime] = None
    Deducciones: List[PlanillaDeduccionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Bitacora ---
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
    Peso_Porcentaje: Decimal = Field(..., gt=Decimal("0"), le=Decimal("100"), description="Ponderación en porcentaje (ej: 20.00)")


class CategoriaEvaluacionCreate(CategoriaEvaluacionBase):
    pass


class CategoriaEvaluacionResponse(CategoriaEvaluacionBase):
    ID_Categoria: int

    model_config = ConfigDict(from_attributes=True)


class EvaluacionChecklistItemCreate(BaseModel):
    ID_Categoria: int = Field(..., description="ID de la categoría de evaluación")
    Puntaje: Decimal = Field(..., ge=Decimal("0"), le=Decimal("100"), description="Puntaje obtenido en esta categoría (0 a 100)")
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
