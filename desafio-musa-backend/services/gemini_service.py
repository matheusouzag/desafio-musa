import os
import json
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

PROMPT = """
Você é especialista em Manifesto de Transporte de Resíduos (MTR).

Analise a imagem enviada.

Extraia os campos:

- MTR
- Gerador
- Tipo de resíduo
- Peso declarado (kg)

IMPORTANTE:

Se algum campo não existir ou não puder ser identificado,
retorne exatamente:

"Não encontrado"

Exemplo:

{
  "mtr": "Não encontrado"
}

Retorne SEMPRE todos os campos.

Formato obrigatório:

{
  "mtrs": [
    {
      "mtr": "001",
      "gerador": "Empresa X",
      "tipo_residuo": "Orgânico",
      "peso_declarado": 2500
    }
  ]
}

Nunca omita campos.

Retorne apenas JSON.
"""


def processar_imagem(image_bytes):

    response = model.generate_content(
        [
            PROMPT,
            {
                "mime_type": "image/jpeg",
                "data": image_bytes
            }
        ]
    )

    content = response.text.strip()

    if content.startswith("```json"):
        content = content.replace("```json", "")
        content = content.replace("```", "")

    try:
        data = json.loads(content)
    
    except Exception:
        return {
            "mtrs": [
                {
                    "mtr": "Não encontrado",
                    "gerador": "Não encontrado",
                    "tipo_residuo": "Não encontrado",
                    "peso_declarado": 0,
                    "revisao_manual": True
                }
            ]
        }
    
    for item in data.get("mtrs", []):

        item.setdefault(
            "mtr",
            "Não encontrado"
        )

        item.setdefault(
            "gerador",
            "Não encontrado"
        )

        item.setdefault(
            "tipo_residuo",
            "Não encontrado"
        )

        item.setdefault(
            "peso_declarado",
            0
        )

        try:
            item["peso_declarado"] = float(
                item["peso_declarado"]
            )

        except Exception:
            item["peso_declarado"] = 0

        item["revisao_manual"] = (
            item["mtr"] == "Não encontrado"
            or item["gerador"] == "Não encontrado"
            or item["tipo_residuo"] == "Não encontrado"
            or item["peso_declarado"] == 0
        )

    return data
