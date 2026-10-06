## Regiões metropolitanas {#rms}

O MobiliDADOS acompanha 9 regiões metropolitanas: Belém, Belo Horizonte, Curitiba, Fortaleza,
Recife, Rio de Janeiro, Salvador, São Paulo e a RIDE do Distrito Federal e Entorno. Todas usam a
**composição de 2021 do IBGE** em todos os anos, para que a série compare sempre o mesmo
território. O valor da RM é calculado **somando os números dos municípios** (óbitos, pessoas,
população) antes de dividir, e não fazendo a média dos percentuais dos municípios.

## População {#populacao}

Os indicadores por habitante usam a população residente do IBGE: Censos de 2000, 2010 e 2022,
Contagem de 2007 e estimativas anuais nos demais anos. Em 2023, sem estimativa do IBGE, vale a
média de 2022 e 2024. Entre 2021 e 2022 há **quebra de série**: as estimativas da década de
2010 superestimaram a população de muitos municípios, e o Censo 2022 corrigiu isso.

## Transporte de média e alta capacidade (TMA) {#tma}

Sistemas de transporte coletivo com capacidade e qualidade acima do ônibus comum, segundo o
mapa anual de TMA do ITDP Brasil:

- **BRT, VLT, monotrilho e aeromóvel:** contam quando atingem o nível **Básico** do Padrão de
  Qualidade BRT (edição 2024): ao menos 3 km de faixas exclusivas e 20 de 35 pontos nos cinco
  elementos (segregação, alinhamento, cobrança fora do veículo, interseções e embarque em nível).
- **Metrô, trem e barca:** contam quando operam numa área urbana contínua, com estações a menos
  de 5 km umas das outras, intervalo médio de até 20 minutos nos dois sentidos das 6h às 22h em
  dia útil e cobrança fora das composições.

Faixas e corredores de ônibus convencionais, vans e táxis não são TMA. Vale o mapa de cada ano:
só entram as estações em operação naquele ano.

## Proximidade a pé {#proximidade}

Os indicadores de proximidade (PNT, PNB, Estações TMA × ciclovias) medem a distância **a pé pela
rede de ruas**, e não em linha reta. Para cada estação ou trecho de ciclovia, o
[OpenTripPlanner](https://www.opentripplanner.org/) calcula a área alcançável caminhando até a
distância do indicador (a *isócrona*). A rede de ruas vem do OpenStreetMap de 1º de janeiro do
ano seguinte ao indicador, para retratar a cidade como estava no fim daquele ano.

A população dos setores censitários é redistribuída em hexágonos de cerca de 0,1 km² (grade H3,
resolução 9). Cada hexágono conta na proporção da sua área coberta pelas isócronas.

## Censo usado nos indicadores geográficos {#censo-setores}

A população por setor censitário vem do **Censo 2010 até o indicador de 2021** e do **Censo 2022
a partir do indicador de 2022**. A troca de Censo cria uma quebra de série entre 2021 e 2022:
parte da mudança nesses anos vem da nova contagem da população, e não de obras.

## Faixas de renda {#renda}

Até 2021 (Censo 2010), os recortes de renda usam a **renda domiciliar per capita** em salários
mínimos: até ½, de ½ a 1, de 1 a 3 e acima de 3. O Censo 2022 não publica essa variável por
setor; a partir de 2022 os recortes usam a **renda do responsável pelo domicílio por morador**,
nas mesmas faixas. As duas séries **não são comparáveis** e por isso têm códigos diferentes
(`_RESP_` a partir de 2022).

## Pessoas negras e mulheres negras {#negras}

Seguindo o IBGE, **pessoas negras** são as que se declaram de cor ou raça **preta ou parda**.
Mulheres negras são as mulheres pretas e pardas.

## Dados do DATASUS {#datasus}

Mortes e internações vêm dos sistemas do Ministério da Saúde (SIM e SIH/DATASUS) e contam o
**município de ocorrência**, não o de residência. Cidades com hospitais de referência ou
rodovias movimentadas concentram casos de pessoas de fora. Os dados têm **subnotificação** e
erros de codificação da causa, que variam entre cidades.
