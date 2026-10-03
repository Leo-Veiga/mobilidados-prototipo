# Dados da aba TMA

Extraídos do Mapa de Transporte de Média e Alta Capacidade (ITDP Brasil). Só as colunas usadas pelo site.

| Arquivo | Origem |
|---|---|
| `corredores.csv` | `Corredores_AAAA.xlsx`: Modo, Cidade_n, Situação, Ano, TMA, Extensão (km) |
| `estacoes.csv` | `Estacoes_AAAA.xlsx`: Modo, Cidade_n, Situação, Ano, TMA |
| `municipios.csv` | municípios por onde passa a rede operacional (Situação "Operacional" e TMA "Sim") |

## Como atualizar

1. Extrair as planilhas novas (pasta com `Corredores_AAAA.xlsx` e `Estacoes_AAAA.xlsx`):
   `python scripts/gerar_tma.py --importar "<pasta>"`
2. Refazer os municípios com a pasta de shapefiles do mesmo ano (usa `sf` e `geobr`, malha municipal 2022):
   `Rscript scripts/municipios_tma.R "<pasta Shapefile>" dados/tma/municipios.csv`
3. `npm run dados` gera `src/data/tma.json`.

Regras de contagem em `scripts/gerar_tma.py`.
