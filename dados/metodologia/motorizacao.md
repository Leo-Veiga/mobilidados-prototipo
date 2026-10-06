---
titulo: Taxa de motorização
tema: Motorização e meio ambiente
resumo: Quantos carros e motos estão registrados para cada mil habitantes.
codigos: TX_MOTO, TX_AUTOMOVEL, TX_MOTOCICLETA, FROTA_*
unidade: veículos por mil habitantes
polaridade: menor-melhor
abrangencia: todos os municípios e 9 regiões metropolitanas
serie: 2001 em diante
atualizacao: Anual, com a frota de dezembro
fontes: senatran, populacao-ibge
conceitos: populacao, rms
detalhe: motorizacao.md
---
## O que mede

Quantos veículos motorizados individuais (carros e motos) estão registrados no município para
cada mil habitantes. Indica a dependência do transporte individual e a pressão sobre as ruas e
o meio ambiente.

## Como é calculado

TX_MOTO = frota de veículos individuais ÷ população × 1.000

- **Frota:** automóvel, caminhonete, camioneta, utilitário, motocicleta e motoneta registrados no
  município em dezembro do ano.
- [População](#populacao) do IBGE no mesmo ano.

## Recortes

| Recorte | Código | Veículos |
|---|---|---|
| Automóveis | `TX_AUTOMOVEL` | Automóvel, caminhonete, camioneta e utilitário |
| Motocicletas | `TX_MOTOCICLETA` | Motocicleta e motoneta |
| Frota total e por tipo | `FROTA_TOT`, `FROTA_<tipo>` | Número de veículos |

A frota é a registrada no endereço do proprietário, não a que circula na cidade.
