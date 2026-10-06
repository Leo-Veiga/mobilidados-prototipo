---
titulo: Mortalidade em sinistros de trânsito
tema: Segurança viária
resumo: Quantas pessoas morrem no trânsito a cada 100 mil habitantes, por tipo de usuário e raça/cor.
codigos: TX_MORT_*, OBITOS_*, PERC_MORTE_NEGROS*
unidade: mortes por 100 mil habitantes
polaridade: menor-melhor
abrangencia: todos os municípios e 9 regiões metropolitanas
serie: 2000 em diante
atualizacao: Anual, quando o DATASUS publica o ano definitivo
fontes: sim, populacao-ibge
conceitos: datasus, populacao, negras, rms
detalhe: mortalidade.md
---
## O que mede

Quantas pessoas morrem no trânsito para cada 100 mil habitantes, por tipo de usuário. Em linha
com a **Visão Zero**, a meta é chegar a zero morte.

## Como é calculado

Taxa = óbitos em sinistros de trânsito ÷ população × 100 mil

- **Sinistro de trânsito:** causa básica do óbito entre V01 e V89 da CID-10 (acidentes de
  transporte terrestre).
- **Município:** o de ocorrência do óbito ([DATASUS](#datasus)).
- [População](#populacao) do IBGE no mesmo ano.

## Recortes

| Recorte | Códigos | Grupos da CID-10 |
|---|---|---|
| Total | `TX_MORT_TOT` | V01–V89 |
| Pedestres | `TX_MORT_PED` | V01–V09 |
| Ciclistas | `TX_MORT_CICL` | V10–V19 |
| Motociclistas | `TX_MORT_MOTO` | V20–V29 |
| Ocupantes de automóvel | `TX_MORT_AUTO` | V40–V49 |
| Outros | `TX_MORT_OUTROS` | V30–V39, V50–V89 |
| Número de óbitos | `OBITOS_<tipo>` | — |
| % de [pessoas negras](#negras) nas mortes | `PERC_MORTE_NEGROS`, `PERC_MORTE_NEGROS_<tipo>` | — |

O percentual de pessoas negras = óbitos de pessoas pretas e pardas ÷ total de óbitos × 100. O
total inclui os óbitos com cor ou raça ignorada. Esse recorte não tem polaridade própria: ele
deve ser lido junto com a participação de pessoas negras na população da cidade.
