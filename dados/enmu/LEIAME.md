# Dados da aba ENMU

| Arquivo | O que é | Quem atualiza |
|---|---|---|
| `projetos.csv` | Banco de projetos do [Portal Mobilidade Brasil](https://mobilidadebrasil.bndes.gov.br/) (BNDES), só as colunas usadas | `python scripts/gerar_enmu.py --importar` |
| `prazos_rm.csv` | Prazo estimado de implantação por RM, do Boletim Informativo nº 6 do ENMU (fev/2026, slide 6) | à mão, se o BNDES publicar novos prazos |
| `monitoramento.csv` | Acompanhamento da MobiliDADOS: o que aconteceu com cada projeto em cada ano | à mão, a cada ano |

## Como preencher `monitoramento.csv`

Uma linha por projeto e por ano em que algo mudou (separador `;`):

| Coluna | Exemplo | Observação |
|---|---|---|
| `id_projeto` | `20101` | coluna `id` de `projetos.csv` |
| `ano` | `2027` | |
| `situacao` | `Em obras` | uma de: Em estruturação; Licitado ou contratado; Em obras; Inaugurado em parte; Inaugurado; Paralisado; Cancelado |
| `km_entregues` | `2,4` | km que entraram em operação **naquele ano** (0 ou vazio se nada foi inaugurado) |
| `fonte` | link da notícia ou do diário oficial | |
| `observacao` | texto livre | |

Se houver erro (projeto inexistente, situação escrita diferente), o build para e diz a linha.
