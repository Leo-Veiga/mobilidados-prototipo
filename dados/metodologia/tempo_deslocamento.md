---
titulo: Tempo de deslocamento casa-trabalho
tema: Deslocamentos
resumo: Quanto tempo as pessoas levam de casa ao trabalho e quantas gastam mais de 1 hora.
codigos: TEMPO_MED*, PERC_ACIMA_1H*, PESSOAS_DESLOC*
unidade: minutos (tempo médio) e % (mais de 1 hora)
polaridade: menor-melhor
abrangencia: todos os municípios e 9 regiões metropolitanas
serie: 2022
atualizacao: Decenal (Censo Demográfico)
fontes: censo2022-deslocamento
conceitos: negras, rms
detalhe: tempo_deslocamento.md
---
## O que mede

Quanto tempo as pessoas levam de casa até o trabalho, em média, e quantas gastam **mais de 1
hora** nesse trajeto. O universo são as pessoas de 10 anos ou mais que trabalham fora de casa e
voltam para casa 3 dias ou mais por semana.

## Como é calculado

O Censo informa quantas pessoas estão em cada uma de 7 faixas de tempo. Cada faixa vale o seu
ponto médio, e a última, aberta, vale o seu início:

| Faixa | Minutos |
|---|---:|
| Até 5 min | 2,5 |
| 6 a 15 min | 10,5 |
| Mais de 15 a 30 min | 22,5 |
| Mais de 30 min a 1 h | 45 |
| Mais de 1 h a 2 h | 90 |
| Mais de 2 h a 4 h | 180 |
| Mais de 4 h | 240 |

- Tempo médio = Σ (pessoas da faixa × minutos) ÷ total de pessoas
- Mais de 1 hora = pessoas nas três últimas faixas ÷ total de pessoas × 100

## Recortes

| Recorte | Sufixo | Categorias do Censo |
|---|---|---|
| A pé | `_A_PE` | A pé |
| Bicicleta | `_BICI` | Bicicleta |
| Transporte coletivo | `_TRANSP_COLETIVO` | Ônibus, BRT, trem ou metrô, van, embarcação de médio e grande porte, pau de arara |
| Transporte individual motorizado | `_TRANSP_IND_MOTO` | Automóvel, motocicleta, mototáxi, táxi |
| Outros meios | `_OUTROS` | Embarcação de pequeno porte, outros |
| Pessoas brancas | `_BRANCA` | Branca |
| [Pessoas negras](#negras) | `_NEGRA` | Preta e parda |

O meio de transporte é aquele em que a pessoa passa mais tempo no trajeto. `PESSOAS_DESLOC` é o
número de pessoas na base de cada recorte.
