from .departamentos import router as departamentos_router
from .empleados import router as empleados_router
from .ubicaciones import router as ubicaciones_router
from .roles import router as roles_router
from .permisos import router as permisos_router
from .tipos_deduccion import router as tipos_deduccion_router
from .contratos import router as contratos_router
from .asistencia import router as asistencia_router
from .vacaciones import router as vacaciones_router
from .planilla import router as planilla_router, router_singular as planilla_singular_router
from .bitacora import router as bitacora_router
from .evaluaciones import router as evaluaciones_router

__all__ = [
    "departamentos_router",
    "empleados_router",
    "ubicaciones_router",
    "roles_router",
    "permisos_router",
    "tipos_deduccion_router",
    "contratos_router",
    "asistencia_router",
    "vacaciones_router",
    "planilla_router",
    "planilla_singular_router",
    "bitacora_router",
    "evaluaciones_router",
]
