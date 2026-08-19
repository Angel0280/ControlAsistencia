# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy import text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db
from app.routers import (
    bitacora_router,
    contratos_router,
    departamentos_router,
    empleados_router,
    permisos_router,
    planilla_router,
    roles_router,
    tipos_deduccion_router,
    ubicaciones_router,
    vacaciones_router,
    asistencia_router,
    evaluaciones_router,
)

app = FastAPI(
    title="API de Asistencia",
    description="Backend para el control de asistencia, contratos y planillas",
    version="1.0.0",
)

origenes_permitidos = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    # "http://localhost:3000", # Descomenta si usas otro puerto
    # "*",                     # Permite TODOS los orígenes (solo recomendado para desarrollo local)
]

# 2. Agregar el Middleware a la aplicación
app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos, # Orígenes que tienen permiso
    allow_credentials=True,            # Permite el envío de cookies/credenciales
    allow_methods=["*"],               # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],               # Permite todos los headers
)

@app.get("/")
def ruta_raiz():
    return {"message": "Bienvenido a la API de asistencia"}

@app.get("/api/estado")
def verificar_estado(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"estado": "OK", "base_de_datos": "Activa"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))

app.include_router(departamentos_router)
app.include_router(ubicaciones_router)
app.include_router(roles_router)
app.include_router(permisos_router)
app.include_router(tipos_deduccion_router)
app.include_router(empleados_router)
app.include_router(contratos_router)
app.include_router(asistencia_router)
app.include_router(vacaciones_router)
app.include_router(planilla_router)
app.include_router(bitacora_router)
app.include_router(evaluaciones_router)

