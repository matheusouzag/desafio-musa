# Desafio Musa — Rateio de MTRs

WebApp para conferência automática do peso declarado em Manifestos de Transporte de Resíduos (MTRs) contra o peso real medido na balança. O usuário envia uma ou mais fotos de MTRs e informa o peso real do caminhão; o backend usa o Gemini (Google Generative AI) para extrair os dados de cada manifesto e calcula a diferença entre o que foi declarado e o que efetivamente chegou.

## Funcionalidades

- Upload de uma ou várias fotos de MTRs (JPG, PNG ou WEBP) junto com o peso real do caminhão.
- Extração automática, via IA, dos campos de cada MTR: número do MTR, gerador, tipo de resíduo e peso declarado.
- Soma dos pesos declarados e comparação com o peso real, indicando se o total chegou correto, a mais ou a menos.
- Sinalização de MTRs que precisam de revisão manual quando algum campo não é identificado pela IA.
- Tela de resultado com cards-resumo e tabelas de MTRs processados e de problemas encontrados.

## Tecnologias

**Backend**
- Python 3
- FastAPI + Uvicorn
- google-generativeai (Gemini, modelo `gemini-2.5-flash`)
- python-dotenv, python-multipart, pydantic

**Frontend**
- HTML5, CSS3 e JavaScript puro (sem frameworks/build step)
- Consumo da API via `fetch`

## Estrutura do projeto

```
desafio-musa/
├── desafio-musa-backend/
│   ├── app.py                       # instância FastAPI, CORS e rota raiz
│   ├── routes/
│   │   └── mtr.py                   # rota POST /processar-mtrs
│   ├── services/
│   │   └── gemini_service.py        # integração com o Gemini e parsing do retorno
│   ├── uploads/                     # imagens de exemplo para testes
│   ├── requirements.txt
│   └── .env                         # GEMINI_API_KEY (não versionado)
└── desafio-musa-frontend/
    ├── index.html                   # tela de upload + tela de resultado
    ├── css/styles.css
    ├── js/app.js                    # lógica de upload e renderização do resultado
    └── assets/logo-musa.png
```

## Como rodar

### Pré-requisitos
- Python 3.10+
- Uma chave de API do Gemini ([Google AI Studio](https://aistudio.google.com/))
- Um navegador (e, opcionalmente, um servidor estático simples para servir o frontend)

### 1. Backend

```bash
cd desafio-musa-backend
pip install -r requirements.txt
```

Crie um arquivo `.env` dentro de `desafio-musa-backend/` com:

```
GEMINI_API_KEY=sua_chave_aqui
```

Suba a API:

```bash
uvicorn app:app --reload 
```

A API ficará disponível em `http://localhost:8000`.

### 2. Frontend

O frontend é estático e já está configurado para apontar para `http://localhost:8000` (veja `CONFIG.API_URL` em `js/app.js`). Basta abrir o `index.html` no navegador ou servir a pasta com qualquer servidor estático, por exemplo:

```bash
cd desafio-musa-frontend
python -m http.server 5500
```

E acessar `http://localhost:5500`.
ou utilizar a extensão Live Server Web Extension para acessar através do "Go Live".

## Endpoint da API

### `POST /processar-mtrs`

Recebe `multipart/form-data` com:

| Campo | Tipo | Descrição |
|---|---|---|
| `peso_real` | float | Peso real medido na balança (kg) |
| `imagens` | file[] | Uma ou mais fotos de MTRs |

**Exemplo de resposta:**

```json
{
  "peso_real": 28500,
  "soma_declarada": 27800,
  "diferenca": -700,
  "percentual_diferenca": -2.46,
  "status": "veio_a_menos",
  "faltantes_mtrs": [
    {
      "mtr": "Não encontrado",
      "problemas": ["MTR não identificado", "Peso declarado não identificado"]
    }
  ],
  "mtrs": [
    {
      "mtr": "001",
      "gerador": "Empresa X",
      "tipo_residuo": "Orgânico",
      "peso_declarado": 2500,
      "revisao_manual": false
    }
  ]
}
```

O campo `status` pode ser `correto`, `veio_a_mais` ou `veio_a_menos`, dependendo da diferença entre a soma declarada e o peso real.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `GEMINI_API_KEY` | Chave de API do Gemini, usada em `services/gemini_service.py` para autenticar as chamadas ao modelo |

O arquivo `.env` já está listado no `.gitignore` do backend e não deve ser commitado.
