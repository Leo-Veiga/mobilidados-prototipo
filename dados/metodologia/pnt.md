---
titulo: População próxima de transporte de média e alta capacidade (PNT)
tema: Acesso ao transporte
resumo: Quanto da população mora a até 1 km a pé de uma estação de metrô, trem, BRT, VLT ou barca.
codigos: PNT, PNT_*
unidade: % da população
polaridade: maior-melhor
abrangencia: 27 capitais e 9 regiões metropolitanas
serie: 2018 em diante
atualizacao: Anual, com o mapa de TMA do ano
fontes: mapa-tma, osm, setores, malha
conceitos: tma, proximidade, censo-setores, renda, negras, rms
detalhe: pnt.md
---
## O que mede

O percentual da população que mora a até **1 km a pé**, pela rede de ruas, de uma estação ou
terminal de [transporte de média e alta capacidade](#tma). Mostra quanto da cidade é atendida
por um transporte rápido e frequente, e quem fica de fora.

## Como é calculado

PNT = população a até 1 km a pé de uma estação TMA ÷ população do território × 100

1. Estações em operação classificadas como TMA no mapa do ano.
2. Área alcançável a pé em 1 km a partir de cada estação ([proximidade a pé](#proximidade)).
3. Cada território usa só as estações que ficam dentro dele: uma estação de Canoas não conta
   para Porto Alegre.
4. A população coberta é somada e dividida pela população total do território.

Capital sem estação TMA no ano tem PNT igual a 0.

## Recortes

| Recorte | Códigos | Anos |
|---|---|---|
| Faixas de [renda domiciliar per capita](#renda) | `PNT_ATE_1/2`, `PNT_1/2_1`, `PNT_1_3`, `PNT_ACIMA_3` | 2018–2021 |
| Faixas de renda do responsável por morador | `PNT_RESP_ATE_1/2` … `PNT_RESP_ACIMA_3` | 2022 em diante |
| [Mulheres negras](#negras) | `PNT_MULHERES_NEGRAS` | todos |
| Mulheres com renda até 1 salário mínimo | `PNT_MULHERES_1SM` | 2018–2021 |

Nos recortes de renda, quanto **mais parecidos** os percentuais das faixas, mais equitativa é a
distribuição das estações.
