from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/contratos", tags=["Contratos"])

@router.post("/", response_model=schemas.ContratoResponse, status_code=201)
def crear_contrato(contrato: schemas.ContratoCreate, db: Session = Depends(get_db)):
    if not db.get(models.Empleado, contrato.ID_Empleado):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    nuevo_contrato = models.Contrato(**contrato.model_dump())
    db.add(nuevo_contrato)
    db.commit()
    db.refresh(nuevo_contrato)
    return nuevo_contrato

@router.get("/", response_model=List[schemas.ContratoResponse])
def obtener_contratos(id_empleado: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Contrato)
    if id_empleado is not None:
        query = query.filter(models.Contrato.ID_Empleado == id_empleado)
    return query.all()

@router.get("/{contrato_id}", response_model=schemas.ContratoResponse)
def obtener_contrato(contrato_id: int, db: Session = Depends(get_db)):
    contrato = db.get(models.Contrato, contrato_id)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contrato
