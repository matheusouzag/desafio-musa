from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Form

from services.gemini_service import processar_imagem

router = APIRouter()


@router.post("/processar-mtrs")
async def processar_mtrs(
    peso_real: float = Form(...),
    imagens: list[UploadFile] = File(...)
):

    todos_mtrs = []
    faltantes_mtrs = []

    for imagem in imagens:

        image_bytes = await imagem.read()

        resultado = processar_imagem(
            image_bytes
        )

        todos_mtrs.extend(
            resultado["mtrs"]
        )
    
    for item in resultado["mtrs"]:

        problemas = []

        if item["mtr"] == "Não encontrado":
            problemas.append("MTR não identificado")

        if item["gerador"] == "Não encontrado":
            problemas.append("Gerador não identificado")

        if item["tipo_residuo"] == "Não encontrado":
            problemas.append("Tipo de resíduo não identificado")

        if item["peso_declarado"] == 0:
            problemas.append("Peso declarado não identificado")

        if problemas:
            faltantes_mtrs.append({
                "mtr": item["mtr"],
                "problemas": problemas
            })

    soma_declarada = sum(
        float(item.get("peso_declarado", 0) or 0)
        for item in todos_mtrs
    )

    # positivo = declarou mais do que chegou
    # negativo = declarou menos do que chegou
    diferenca = soma_declarada - peso_real

    percentual_diferenca = (
        round((diferenca / peso_real) * 100, 2)
        if peso_real > 0
        else 0
    )

    if diferenca == 0:
        status = "correto"

    elif diferenca > 0:
        status = "veio_a_mais"

    else:
        status = "veio_a_menos"

    return {
        "peso_real": peso_real,
        "soma_declarada": soma_declarada,
        "diferenca": diferenca,
        "percentual_diferenca": percentual_diferenca,
        "status": status,
        "faltantes_mtrs": faltantes_mtrs,
        "mtrs": todos_mtrs
    }