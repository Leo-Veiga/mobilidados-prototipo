# MobiliDADOS — site

Site da [MobiliDADOS](https://github.com/mobilidados/MobiliDADOS), plataforma do ITDP Brasil com indicadores e dados
abertos de mobilidade urbana das capitais e regiões metropolitanas brasileiras.

**Site:** https://leo-veiga.github.io/mobilidados-site/

O site é **100% estático**: o build gera arquivos HTML, CSS, JS e CSV que podem ser hospedados de graça
(GitHub Pages). Não há servidor nem banco de dados.

## O que já está no ar

- Página inicial
- Capitais: lista das 27 capitais e uma página por capital (`/capitais/recife/`), com ficha, distribuição
  da infraestrutura e série histórica dos indicadores
- Regiões metropolitanas: *em breve*

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
  planilha.xlsx               planilha de origem (abas Info_gerais_* e Indicadores_*)
  catalogo-indicadores.csv    nome e unidade de cada indicador (editável no Excel)
scripts/
  gerar_dados.py              planilha -> src/data/*.json e public/dados/*.csv
  pos-build.mjs               ajuste do build para o GitHub Pages
src/
  app/                        páginas (cada pasta é uma URL)
  components/                 peças reutilizáveis (menu, capa, gráficos, filtros...)
  data/                       JSON gerados — não edite à mão
  lib/                        tipos, formatação e acesso aos dados
public/
  img/                        imagens, ícones e logos
  dados/                      CSVs para download (gerados)
```

## Rodar no computador

Requisitos: [Node.js](https://nodejs.org) 20.9 ou mais novo e Python 3 com `openpyxl`.

```bash
npm install        # uma vez, instala as dependências
npm run dev        # abre em http://localhost:3000 e recarrega a cada alteração
npm run build      # gera o site final na pasta out/
```

## Atualizar os dados

1. Substitua `dados/planilha.xlsx` (mantendo os nomes das abas e colunas).
2. Se houver indicador novo, acrescente uma linha em `dados/catalogo-indicadores.csv`.
3. Rode:

   ```bash
   pip install -r scripts/requirements.txt   # só na primeira vez
   npm run dados
   ```

   O script avisa se algum indicador da planilha estiver sem nome no catálogo.
4. Confira com `npm run dev` e faça o commit dos arquivos alterados.

## Publicação

Cada push na branch `main` publica o site automaticamente no GitHub Pages
(workflow em `.github/workflows/publicar.yml`; acompanhe na aba **Actions**).

Sem domínio próprio o site fica em `https://<usuario>.github.io/mobilidados-site/`. Esse subcaminho vem da
variável `BASE_PATH` (ver `next.config.ts`). Com domínio próprio, basta remover `BASE_PATH` do workflow.

## Licença

- Código: [MIT](LICENSE)
- Conteúdo e dados: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt_BR)
