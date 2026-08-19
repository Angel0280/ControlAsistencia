from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
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
    planilla_singular_router,
    roles_router,
    tipos_deduccion_router,
    ubicaciones_router,
    vacaciones_router,
    asistencia_router,
    evaluaciones_router,
)

from app import models, schemas

app = FastAPI(
    title="API de Asistencia",
    description="Backend para el control de asistencia, contratos y planillas",
    version="1.0.0",
)

origenes_permitidos = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

# 2. Agregar el Middleware a la aplicación
app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/api/catalogos", response_model=schemas.CatalogosResponse)
def obtener_catalogos(db: Session = Depends(get_db)):
    departamentos = db.query(models.Departamento).filter(models.Departamento.Estado == True).all()
    roles = db.query(models.Rol).filter(models.Rol.Estado == True).all()
    ubicaciones = db.query(models.Ubicacion).filter(models.Ubicacion.Estado == True).all()
    return {
        "departamentos": departamentos,
        "roles": roles,
        "ubicaciones": ubicaciones,
    }

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
app.include_router(planilla_singular_router)
app.include_router(bitacora_router)
app.include_router(evaluaciones_router)

