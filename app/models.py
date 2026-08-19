# pyrefly: ignore [missing-import]
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    Time,
    Numeric,
    ForeignKey,
    DateTime,
    Table,
    UniqueConstraint,
    text,
)
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship

from .database import Base

roles_permisos = Table(
    "Roles_Permisos",
    Base.metadata,
    Column("ID_Rol", Integer, ForeignKey("Roles.ID_Rol"), primary_key=True),
    Column("ID_Permiso", Integer, ForeignKey("Permisos.ID_Permiso"), primary_key=True),
)


class Departamento(Base):
    __tablename__ = "Departamentos"

    ID_Departamento = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Estado = Column(Boolean, default=True)

    empleados = relationship("Empleado", back_populates="departamento")


class Rol(Base):
    __tablename__ = "Roles"

    ID_Rol = Column(Integer, primary_key=True, index=True)
    Nombre_Rol = Column(String(50), nullable=False)
    Responsabilidades = Column(String, nullable=True)
    Estado = Column(Boolean, default=True)

    empleados = relationship("Empleado", back_populates="rol")
    permisos = relationship(
        "Permiso",
        secondary=roles_permisos,
        back_populates="roles",
    )


class Permiso(Base):
    __tablename__ = "Permisos"

    ID_Permiso = Column(Integer, primary_key=True, index=True)
    Nombre_Permiso = Column(String(100), nullable=False)
    Modulo = Column(String(50), nullable=False)
    Estado = Column(Boolean, default=True)

    roles = relationship(
        "Rol",
        secondary=roles_permisos,
        back_populates="permisos",
    )


class TipoDeduccion(Base):
    __tablename__ = "TiposDeduccion"

    ID_TipoDeduccion = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Es_Porcentaje = Column(Boolean, default=False)
    Valor_Referencia = Column(Numeric(10, 4), nullable=True)
    Obligatoria = Column(Boolean, default=False)
    Estado = Column(Boolean, default=True)

    deducciones = relationship("PlanillaDeduccion", back_populates="tipo_deduccion")


class Ubicacion(Base):
    __tablename__ = "Ubicaciones"

    ID_Ubicacion = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Direccion = Column(String(200), nullable=True)
    Estado = Column(Boolean, default=True)

    empleados = relationship("Empleado", back_populates="ubicacion")
    asistencias = relationship("Asistencia", back_populates="ubicacion")


class Empleado(Base):
    __tablename__ = "Empleados"

    ID_Empleado = Column(Integer, primary_key=True, index=True)
    Entra_ID = Column(String, nullable=True)
    Pin_Acceso = Column(String(10), nullable=True)
    Numero_Empleado = Column(String(20), nullable=False, unique=True)
    Nombre = Column(String(150), nullable=False)
    Apellido = Column(String(150), nullable=False)
    INSS = Column(String(20), unique=True, nullable=False)
    Fecha_Contratacion = Column(Date, nullable=False)
    Salario_Base = Column(Numeric(18, 2), nullable=False)
    Dias_Vacaciones_Disponibles = Column(Numeric(5, 2), default=0.00)
    ID_Departamento = Column(Integer, ForeignKey("Departamentos.ID_Departamento"), nullable=False)
    ID_Rol = Column(Integer, ForeignKey("Roles.ID_Rol"), nullable=False)
    ID_Ubicacion = Column(Integer, ForeignKey("Ubicaciones.ID_Ubicacion"), nullable=False)
    Estado = Column(Boolean, default=True)

    departamento = relationship("Departamento", back_populates="empleados")
    rol = relationship("Rol", back_populates="empleados")
    ubicacion = relationship("Ubicacion", back_populates="empleados")
    asistencias = relationship("Asistencia", back_populates="empleado")
    contratos = relationship("Contrato", back_populates="empleado")
    vacaciones = relationship("Vacacion", back_populates="empleado")
    planillas = relationship("Planilla", back_populates="empleado")
    bitacoras = relationship("Bitacora", back_populates="empleado")
    evaluaciones_recibidas = relationship(
        "Evaluacion",
        foreign_keys="[Evaluacion.ID_Empleado]",
        back_populates="empleado",
    )
    evaluaciones_realizadas = relationship(
        "Evaluacion",
        foreign_keys="[Evaluacion.ID_Evaluador]",
        back_populates="evaluador",
    )



class Contrato(Base):
    __tablename__ = "Contratos"

    ID_Contrato = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    Tipo_Contrato = Column(String(50), nullable=False)
    Fecha_Inicio = Column(Date, nullable=False)
    Fecha_Fin = Column(Date, nullable=True)
    Salario_Pactado = Column(Numeric(18, 2), nullable=False)
    Documento_Path = Column(String(300), nullable=True)
    Estado = Column(String(20), default="Vigente")

    empleado = relationship("Empleado", back_populates="contratos")


class Asistencia(Base):
    __tablename__ = "Asistencia"

    ID_Asistencia = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    Fecha = Column(Date, nullable=False)
    Hora_Entrada = Column(Time, nullable=True)
    Hora_Salida = Column(Time, nullable=True)
    ID_Ubicacion = Column(Integer, ForeignKey("Ubicaciones.ID_Ubicacion"), nullable=True)
    IP_Marcaje = Column(String(45), nullable=True)
    Horas_Trabajadas = Column(Numeric(5, 2), nullable=True)
    Estado = Column(String(20), default="Presente")

    empleado = relationship("Empleado", back_populates="asistencias")
    ubicacion = relationship("Ubicacion", back_populates="asistencias")

    __table_args__ = (
        UniqueConstraint("ID_Empleado", "Fecha", name="UQ_Asistencia_Dia"),
    )


class Vacacion(Base):
    __tablename__ = "Vacaciones"

    ID_Vacacion = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    Fecha_Inicio = Column(Date, nullable=False)
    Fecha_Fin = Column(Date, nullable=False)
    Dias_Tomados = Column(Numeric(5, 2), nullable=False)
    Estado_Solicitud = Column(String(20), default="Aprobada")
    Observaciones = Column(String(255), nullable=True)

    empleado = relationship("Empleado", back_populates="vacaciones")


class Planilla(Base):
    __tablename__ = "Planilla"

    ID_Planilla = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    Mes = Column(Integer, nullable=False)
    Anio = Column(Integer, nullable=False)
    Quincena = Column(Integer, nullable=True)
    Salario_Bruto = Column(Numeric(18, 2), nullable=False)
    Pago_Horas_Extras = Column(Numeric(18, 2), default=0.00)
    Ausencias_Deduccion = Column(Numeric(18, 2), default=0.00)
    Total_Deducciones = Column(Numeric(18, 2), nullable=False, default=0.00)
    Salario_Neto = Column(Numeric(18, 2), nullable=False)
    Fecha_Generacion = Column(DateTime, server_default=text("GETDATE()"))

    empleado = relationship("Empleado", back_populates="planillas")
    deducciones = relationship("PlanillaDeduccion", back_populates="planilla", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("ID_Empleado", "Mes", "Anio", "Quincena", name="UQ_Planilla_Periodo"),
    )


class PlanillaDeduccion(Base):
    __tablename__ = "Planilla_Deducciones"

    ID_Planilla_Deduccion = Column(Integer, primary_key=True, index=True)
    ID_Planilla = Column(Integer, ForeignKey("Planilla.ID_Planilla"), nullable=False)
    ID_TipoDeduccion = Column(Integer, ForeignKey("TiposDeduccion.ID_TipoDeduccion"), nullable=False)
    Monto = Column(Numeric(18, 2), nullable=False)

    planilla = relationship("Planilla", back_populates="deducciones")
    tipo_deduccion = relationship("TipoDeduccion", back_populates="deducciones")


class Bitacora(Base):
    __tablename__ = "Bitacora"

    ID_Bitacora = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=True)
    Tabla_Afectada = Column(String(50), nullable=False)
    Accion = Column(String(20), nullable=False)
    Detalle = Column(String(500), nullable=True)
    Fecha = Column(DateTime, server_default=text("GETDATE()"))

    empleado = relationship("Empleado", back_populates="bitacoras")


class CategoriaEvaluacion(Base):
    __tablename__ = "CategoriasEvaluacion"

    ID_Categoria = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Peso_Porcentaje = Column(Numeric(5, 2), nullable=False)

    checklist_items = relationship("EvaluacionChecklist", back_populates="categoria")


class Evaluacion(Base):
    __tablename__ = "Evaluaciones"

    ID_Evaluacion = Column(Integer, primary_key=True, index=True)
    ID_Empleado = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    ID_Evaluador = Column(Integer, ForeignKey("Empleados.ID_Empleado"), nullable=False)
    Fecha_Evaluacion = Column(Date, nullable=False)
    Periodo_Inicio = Column(Date, nullable=False)
    Periodo_Fin = Column(Date, nullable=False)
    Puntuacion_Final = Column(Numeric(5, 2), nullable=False)
    Comentarios_Generales = Column(String(500), nullable=True)

    empleado = relationship(
        "Empleado",
        foreign_keys=[ID_Empleado],
        back_populates="evaluaciones_recibidas",
    )
    evaluador = relationship(
        "Empleado",
        foreign_keys=[ID_Evaluador],
        back_populates="evaluaciones_realizadas",
    )
    checklist_items = relationship(
        "EvaluacionChecklist",
        back_populates="evaluacion",
        cascade="all, delete-orphan",
    )


class EvaluacionChecklist(Base):
    __tablename__ = "Evaluacion_Checklist"

    ID_Checklist = Column(Integer, primary_key=True, index=True)
    ID_Evaluacion = Column(Integer, ForeignKey("Evaluaciones.ID_Evaluacion"), nullable=False)
    ID_Categoria = Column(Integer, ForeignKey("CategoriasEvaluacion.ID_Categoria"), nullable=False)
    Puntaje = Column(Numeric(5, 2), nullable=False)
    Observaciones = Column(String(255), nullable=True)

    evaluacion = relationship("Evaluacion", back_populates="checklist_items")
    categoria = relationship("CategoriaEvaluacion", back_populates="checklist_items")

