---
titulo: Estações de transporte de média e alta capacidade próximas de ciclovias
tema: Acesso ao transporte
resumo: Quantas estações de metrô, trem, BRT, VLT ou barca ficam a até 300 m a pé de uma ciclovia ou ciclofaixa.
codigos: TMA_INFRA_CICLO, TMA_ESTACOES, TMA_ESTACOES_CICLO
unidade: % das estações
polaridade: maior-melhor
abrangencia: capitais com estação de TMA no ano
serie: 2018 em diante
atualizacao: Anual, com o mapa de TMA e o OpenStreetMap
fontes: mapa-tma, osm, malha
conceitos: tma, proximidade
detalhe: tma_ciclo.md
---
## O que mede

O percentual das estações de [transporte de média e alta capacidade](#tma) que ficam perto da
infraestrutura cicloviária. Indica se é fácil combinar bicicleta e transporte coletivo na
mesma viagem.

## Como é calculado

TMA_INFRA_CICLO = estações a até 300 m a pé de ciclovia ou ciclofaixa ÷ estações da capital × 100

1. Estações em operação classificadas como TMA no mapa do ano, dentro do limite da capital.
2. Uma estação está perto quando fica dentro da área alcançável a pé em 300 m a partir das
   ciclovias e ciclofaixas, a mesma área usada no [PNB](#pnb)
   ([proximidade a pé](#proximidade)).

Só entram as capitais com ao menos uma estação de TMA no ano.

## Recortes

| Indicador | Código |
|---|---|
| Número de estações de TMA na capital | `TMA_ESTACOES` |
| Número de estações perto de ciclovia ou ciclofaixa | `TMA_ESTACOES_CICLO` |

Em capitais com poucas estações, cada estação muda bastante o percentual: vale olhar os números
absolutos junto.
