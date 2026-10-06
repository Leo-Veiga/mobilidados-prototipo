---
titulo: População próxima da infraestrutura cicloviária (PNB)
tema: Acesso ao transporte
resumo: Quanto da população mora a até 300 m a pé de uma ciclovia ou ciclofaixa.
codigos: PNB, PNB_*, PNPB, PNPB_*
unidade: % da população
polaridade: maior-melhor
abrangencia: 27 capitais
serie: 2018 em diante
atualizacao: Anual, com o OpenStreetMap de 1º de janeiro do ano seguinte
fontes: osm, setores, malha
conceitos: proximidade, censo-setores, renda, negras
detalhe: pnb.md
---
## O que mede

O percentual da população que mora a até **300 m a pé**, pela rede de ruas, de uma ciclovia ou
ciclofaixa. Mostra quanto da cidade tem acesso fácil a uma via segura para pedalar.

## Como é calculado

PNB = população a até 300 m a pé de ciclovia ou ciclofaixa ÷ população da capital × 100

1. Ciclovias e ciclofaixas dentro da capital, pelo OpenStreetMap, com a mesma classificação do
   [CicloMapa](https://ciclomapa.org.br/).
2. Pontos a cada 20 m ao longo da infraestrutura.
3. Área alcançável a pé em 300 m a partir de cada ponto ([proximidade a pé](#proximidade)).
4. A população coberta é somada e dividida pela população total da capital.

O **PNPB** é o mesmo cálculo só com ciclovias (vias separadas dos carros), sem as ciclofaixas.

## Recortes

| Recorte | Códigos | Anos |
|---|---|---|
| Faixas de [renda domiciliar per capita](#renda) | `PNB_ATE_1/2`, `PNB_1/2_1`, `PNB_1_3`, `PNB_ACIMA_3` | 2018–2021 |
| Faixas de renda do responsável por morador | `PNB_RESP_ATE_1/2` … `PNB_RESP_ACIMA_3` | 2022 em diante |
| [Mulheres negras](#negras) | `PNB_MULHERES_NEGRAS` | todos |
| Mulheres com renda até 1 salário mínimo | `PNB_MULHERES_1SM` | 2018–2021 |
| Só ciclovias | `PNPB`, `PNPB_<recorte>` | todos |

Nos recortes de renda, quanto **mais parecidos** os percentuais das faixas, mais equitativa é a
distribuição da infraestrutura.
