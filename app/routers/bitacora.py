from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/bitacora", tags=["Bitacora"])

@router.post("/", response_model=schemas.BitacoraResponse, status_code=201)
def crear_bitacora(evento: schemas.BitacoraCreate, db: Session = Depends(get_db)):
    if evento.ID_Empleado and not db.get(models.Empleado, evento.ID_Empleado):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    nueva_entrada = models.Bitacora(**evento.model_dump())
    db.add(nueva_entrada)
    db.commit()
    db.refresh(nueva_entrada)
    return nueva_entrada

@router.get("/", response_model=List[schemas.BitacoraResponse])
def obtener_bitacora(id_empleado: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Bitacora)
    if id_empleado is not None:
        query = query.filter(models.Bitacora.ID_Empleado == id_empleado)
    return query.order_by(models.Bitacora.Fecha.desc()).all()
