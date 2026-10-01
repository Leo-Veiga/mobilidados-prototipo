# MobiliDADOS — site (PROTÓTIPO)

> Versão de teste, separada do site oficial ([Leo-Veiga/mobilidados-site](https://github.com/Leo-Veiga/mobilidados-site)).
> Testa a seção **Destaques**: cards que viram, com explicação, gráfico, fonte e compartilhamento
> (imagens geradas no build em `src/app/destaques/[id]/[arquivo]/route.tsx`; conteúdo em `src/lib/destaques.ts`).

Site da [MobiliDADOS](https://github.com/mobilidados/MobiliDADOS), plataforma do ITDP Brasil com indicadores e dados
abertos de mobilidade urbana das capitais e regiões metropolitanas brasileiras.

**Site:** https://leo-veiga.github.io/mobilidados-site/

O site é **100% estático**: o build gera arquivos HTML, CSS, JS e CSV que podem ser hospedados de graça
(GitHub Pages). Não há servidor nem banco de dados.

## O que já está no ar

- Página inicial, com busca por localização ou indicador
- Buscar dados (`/buscar/`, `/capitais/`, `/regioes-metropolitanas/`, `/indicadores/`)
- Uma página por capital (`/capitais/recife/`): ficha (informações gerais e mobilidade), valor mais recente
  de cada indicador e distribuição da infraestrutura
- Uma página por região metropolitana (`/regioes-metropolitanas/rmr/`): ficha, população e densidade,
  divisão modal, valor mais recente de cada indicador e distribuição da infraestrutura
- Uma página por indicador (`/indicadores/pnt/`): comparação entre capitais ou regiões metropolitanas
  e série histórica
- Todo gráfico tem o botão "Baixar imagem" (PNG com título, fonte e data dos dados)

O visual segue o design do site MobiliDADOS de 2024–2025 (fundo escuro, verde `#64EAA6`, fonte Open Sans).

## Tecnologias

| Parte | Ferramenta |
|---|---|
| Site | [Next.js](https://nextjs.org) (exportação estática) + TypeScript |
| Visual | CSS Modules |
| Gráficos | [Chart.js](https://www.chartjs.org) |
| Dados | Script Python que converte a planilha em JSON e CSV |

## Estrutura

```
dados/
  planilha.xlsx               planilha de origem (abas Info_gerais_* e Indicadores_*); qualquer nome .xlsx serve
  catalogo-indicadores.csv    nome e unidade de cada indicador (editável no Excel)
scripts/
  gerar_dados.py              planilha -> src/data/*.json e public/dados/*.csv
  pos-build.mjs               ajuste do build para o GitHub Pages
src/
  app/                        páginas (cada pasta é uma URL)
  components/                 peças reutilizáveis (cabeçalho, abas, busca, gráficos, filtros...)
  data/                       JSON gerados a cada build (fora do git)
  lib/                        tipos, formatação e acesso aos dados
public/
  img/                        imagens, ícones e logos
  dados/                      CSVs para download (gerados a cada build, fora do git)
```

## Rodar no computador

Requisitos: [Node.js](https://nodejs.org) 20.9 ou mais novo e Python 3.

```bash
npm install                               # uma vez: dependências do site
pip install -r scripts/requirements.txt   # uma vez: dependência do conversor
npm run dev        # converte a planilha e abre em http://localhost:3000
npm run build      # converte a planilha e gera o site final na pasta out/
```

## Atualizar os dados (sem instalar nada)

Pelo navegador, no GitHub:

1. Abra a pasta [`dados/`](dados/) do repositório.
2. Clique em **Add file → Upload files** e envie a planilha nova (as abas e colunas precisam seguir o
   mesmo modelo). Se o nome for diferente de `planilha.xlsx`, **apague a planilha antiga** no mesmo envio
   ou logo depois: a pasta deve ter uma única `.xlsx`.
3. Escreva uma descrição (ex.: "Dados de 2025") e clique em **Commit changes**.
4. Acompanhe na aba **Actions**. Em uns 2 minutos o site está atualizado.

Antes de publicar, o conversor confere a planilha: abas e colunas obrigatórias, 27 capitais, 9 regiões
metropolitanas e anos válidos. **Se algo estiver errado, nada é publicado**: o site continua na versão
anterior, o GitHub envia um e-mail e o passo "Converter e validar a planilha" mostra a lista de problemas.
Avisos (por exemplo, indicador novo sem nome) não impedem a publicação.

Indicador novo? Acrescente uma linha em [`dados/catalogo-indicadores.csv`](dados/catalogo-indicadores.csv)
com código, nome e unidade. Sem isso, o site mostra o código da coluna no lugar do nome.

A data "Dados atualizados em", no rodapé, é a data em que a planilha foi salva pela última vez.

Para testar no computador antes de enviar: `npm run dados` (só confere e converte) ou `npm run dev`.

## Publicação

Cada push na branch `main` publica o site automaticamente no GitHub Pages
(workflow em `.github/workflows/publicar.yml`; acompanhe na aba **Actions**).

Sem domínio próprio o site fica em `https://<usuario>.github.io/mobilidados-site/`. Esse subcaminho vem da
variável `BASE_PATH` (ver `next.config.ts`). Com domínio próprio, basta remover `BASE_PATH` do workflow.

## Licença

- Código: [MIT](LICENSE)
- Conteúdo e dados: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt_BR)
