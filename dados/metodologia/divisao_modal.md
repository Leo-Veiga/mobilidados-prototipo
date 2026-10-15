---
titulo: Divisão modal
tema: Deslocamentos
resumo: Como as viagens se dividem entre a pé, bicicleta, transporte coletivo e transporte individual motorizado.
codigos: PERC_A PÉ, PERC_A PE, PERC_BICI, PERC_TRANSP_COLETIVO, PERC_TRANSP_IND_MOTO
unidade: % das viagens
polaridade: neutra
abrangencia: regiões metropolitanas e capitais com pesquisa origem-destino publicada
serie: 1996 a 2023, nos anos em que houve pesquisa
atualizacao: Quando sai uma nova pesquisa origem-destino (sem data fixa)
fontes: pesquisas-od
conceitos: rms
detalhe:
---
## O que mede

A parte das viagens feitas **a pé**, de **bicicleta**, de **transporte coletivo** e de
**transporte individual motorizado** num dia útil. Cada viagem conta uma vez, no seu modo principal.

## Como é calculado

Não há base nacional de divisão modal. O MobiliDADOS reúne os números publicados nas pesquisas
origem-destino (OD) e nos planos de transporte de cada região metropolitana e capital. O PDF de cada
estudo fica guardado junto com a tabela.

Percentual do modo = viagens do modo ÷ total de viagens × 100, como a pesquisa publica.

**Modo principal:** é o que o próprio estudo define. Em geral é o modo de maior hierarquia
(metrô > trem > ônibus > automóvel > moto > bicicleta > a pé) ou o de maior tempo na viagem.

**Agrupamento dos modos:**

| Grupo | Modos |
|---|---|
| A pé | a pé |
| Bicicleta | bicicleta |
| Transporte coletivo | ônibus (municipal, intermunicipal, executivo), metrô, trem, BRT, VLT, lotação e van, barca, transporte escolar, fretado |
| Transporte individual motorizado | automóvel (condutor e passageiro), táxi, aplicativo, motocicleta, mototáxi |
| Fora dos grupos | caminhão, "outros" e combinações que o estudo não separa |

O que fica fora dos 4 grupos não é redistribuído, então a soma pode ficar um pouco abaixo de 100%.

**Ano:** é o da pesquisa de campo. Se a coleta atravessa dois anos, vale o ano em que terminou. O
ano de publicação do relatório aparece na fonte.

**Território:** cada valor indica a escala da pesquisa (região metropolitana, capital ou área de
estudo). Só se comparam anos da mesma escala.

**Casas decimais:** 1, como nas fontes. Quando a fonte só publica inteiros, o valor fica inteiro.

## Pesquisas usadas

| Local | Escala | Anos | Fonte |
|---|---|---|---|
| Belém | RM | 2000 | PDTU da RM de Belém (2001) |
| Belo Horizonte | RM | 2002, 2012 | OD 2002 e 2012, no diagnóstico do PlanMob-BH (2014) |
| Curitiba | capital | 2017 | OD 2017, "Distribuição modal" (IPPUC) |
| Distrito Federal | DF e Entorno imediato | 2009 | PDTU do DF e Entorno (dados preliminares) |
| Distrito Federal | DF | 2016 | Pesquisa de Mobilidade Urbana 2016, no PDTT/DF (Metrô-DF, 2018) |
| Fortaleza | RM | 1996 | OD 1996, no PTU da RM de Fortaleza |
| Fortaleza | capital | 2019 | OD domiciliar 2019 |
| Recife | RM | 1997 | OD 1997 |
| Recife | RM | 2018 | OD 2018 (ICPS), só viagens a trabalho |
| Recife | capital | 2022 | OD Recife 2021-2022 (CTTU) |
| Rio de Janeiro | RM | 2003, 2012 | OD 2002-2003 e 2012, no PDTU da RM do Rio |
| Salvador | RM | 2012 | OD 2012 |
| São Paulo | RM | 1997, 2007, 2012, 2017, 2023 | OD do Metrô (2012: Pesquisa de Mobilidade) |

## Limitações

- As pesquisas têm métodos, datas e territórios diferentes. Por isso, a comparação entre cidades
  é aproximada.
- **Recife 2018 e 2022** usam questionário online, e não a entrevista em domicílio. A de 2018 cobre
  só as viagens a trabalho. A de 2022 foi feita durante a pandemia e reúne em "outros" 8,3% das viagens
  (aplicativo, táxi, mototáxi, fretado, escolar e bicicleta com ônibus). Nenhuma das duas é comparável
  com a pesquisa domiciliar de 1997.
- **DF 2009**: a fonte só informa o total não motorizado (28%), sem separar a pé e bicicleta.
- Cada pesquisa define a viagem a pé de um jeito. Em Salvador 2012, por exemplo, a caminhada só conta
  se for a trabalho ou escola, ou se passar de 500 m. Pesquisas que excluem as caminhadas curtas
  mostram uma parte a pé menor.
