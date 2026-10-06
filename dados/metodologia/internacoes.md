---
titulo: Internações em sinistros de trânsito
tema: Segurança viária
resumo: Quantas pessoas são internadas pelo SUS por sinistros de trânsito a cada 100 mil habitantes.
codigos: TX_INTERN_*, INTERN_*
unidade: internações por 100 mil habitantes
polaridade: menor-melhor
abrangencia: todos os municípios e 9 regiões metropolitanas
serie: 2008 em diante
atualizacao: Anual, com os 12 meses publicados pelo DATASUS
fontes: sih, populacao-ibge
conceitos: datasus, populacao, rms
detalhe: internacoes.md
---
## O que mede

Quantas internações hospitalares pagas pelo SUS foram causadas por sinistros de trânsito para
cada 100 mil habitantes, por tipo de usuário. Complementa a mortalidade: mostra também quem se
feriu com gravidade.

## Como é calculado

Taxa = internações por sinistros de trânsito ÷ população × 100 mil

- **Sinistro de trânsito:** causa externa entre V01 e V89 da CID-10.
- **Município:** o do hospital onde a pessoa foi internada ([DATASUS](#datasus)).
- **Ano:** o de processamento da internação (AIH aprovada, sem as de prorrogação).
- Só entram internações pagas pelo SUS.

## Recortes

| Recorte | Códigos | Grupos da CID-10 |
|---|---|---|
| Total | `TX_INTERN_TOT` | V01–V89 |
| Pedestres | `TX_INTERN_PED` | V01–V09 |
| Ciclistas | `TX_INTERN_CIC` | V10–V19 |
| Motociclistas | `TX_INTERN_MOTO` | V20–V29 |
| Ocupantes de automóvel | `TX_INTERN_AUTO` | V40–V49 |
| Outros | `TX_INTERN_OUTROS` | V30–V39, V50–V89 |
| Número de internações | `INTERN_<tipo>` | — |
