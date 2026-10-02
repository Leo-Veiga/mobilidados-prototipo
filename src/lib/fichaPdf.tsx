/* Ficha da cidade em PDF (protótipo), gerada no build com @react-pdf/renderer.
   Todos os textos são modelos fixos preenchidos com os dados de lib/ficha.ts. */
import { join } from 'node:path';
import { Document, Font, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { DadosFicha, LinhaIndicador, SerieGrafico } from './ficha';
import { MODOS_TMA } from './tipos';

const RAIZ = process.cwd();
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: join(RAIZ, 'node_modules/@fontsource/open-sans/files/open-sans-latin-400-normal.woff'), fontWeight: 400 },
    { src: join(RAIZ, 'node_modules/@fontsource/open-sans/files/open-sans-latin-700-normal.woff'), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback(p => [p]); // não hifenizar palavras

const VERDE = '#2ab870';
const VERDE_ESCURO = '#006733';
const CINZA = '#585c59';
const CINZA_CLARO = '#d2dcd6';
const FUNDO_CLARO = '#f4fefb';

const s = StyleSheet.create({
  pagina: { fontFamily: 'Open Sans', fontSize: 9, color: '#0e110f', padding: '36 40 56 40' },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2 solid ${VERDE}`, paddingBottom: 12, marginBottom: 14 },
  sobretitulo: { fontSize: 9, color: VERDE_ESCURO, fontWeight: 700, letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: 700, marginTop: 2 },
  sub: { fontSize: 9, color: CINZA, marginTop: 4 },
  logo: { width: 100, height: 40 },
  secao: { fontSize: 12, fontWeight: 700, color: VERDE_ESCURO, marginTop: 10, marginBottom: 5 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: FUNDO_CLARO, borderRadius: 4, padding: 8 },
  item: { width: '33.33%', padding: 3 },
  itemValor: { fontSize: 12, fontWeight: 700 },
  itemRotulo: { fontSize: 7.5, color: CINZA },
  nota: { fontSize: 7.5, color: CINZA, marginTop: 4 },
  tabela: { borderTop: `1 solid ${CINZA_CLARO}` },
  linha: { flexDirection: 'row', borderBottom: `1 solid ${CINZA_CLARO}`, paddingVertical: 3.5, alignItems: 'center' },
  cab: { fontSize: 7.5, fontWeight: 700, color: CINZA },
  colNome: { width: '43%', paddingRight: 6 },
  colUnid: { width: '17%', color: CINZA, fontSize: 7.5 },
  colValor: { width: '11%', textAlign: 'right', fontWeight: 700 },
  colAno: { width: '8%', textAlign: 'right', color: CINZA },
  colMedia: { width: '11%', textAlign: 'right' },
  colPos: { width: '10%', textAlign: 'right' },
  subtema: { fontSize: 9, fontWeight: 700, marginTop: 8, marginBottom: 2 },
  graficos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  grafico: { width: '48.5%', marginBottom: 8, padding: 7, border: `1 solid ${CINZA_CLARO}`, borderRadius: 4 },
  caixaNota: { marginTop: 14, padding: 8, backgroundColor: FUNDO_CLARO, borderRadius: 4 },
  rodape: { position: 'absolute', bottom: 22, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: CINZA, borderTop: `1 solid ${CINZA_CLARO}`, paddingTop: 6 },
});

const num = (v: number | null | undefined, casas = 1) =>
  v == null || Number.isNaN(v) ? 'sem dado' : v.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: 0 });
const pct = (v: number | null | undefined) => (v == null ? 'sem dado' : `${num(v * 100, 0)}%`);
const data = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
const valido = (v: string) => Boolean(v) && !['-', 'NA', 'N/A'].includes(v.trim());
const NOME_MODO: Record<string, string> = { barca: 'Barca', brt: 'BRT', metro: 'Metrô', monotrilho: 'Monotrilho', trem: 'Trem', vlt: 'VLT' };

function Item({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={s.item}>
      <Text style={s.itemValor}>{valor}</Text>
      <Text style={s.itemRotulo}>{rotulo}</Text>
    </View>
  );
}

function Linha({ l }: { l: LinhaIndicador }) {
  return (
    <View style={s.linha} wrap={false}>
      <Text style={s.colNome}>{l.nome}</Text>
      <Text style={s.colUnid}>{l.unidade}</Text>
      <Text style={s.colValor}>{num(l.valor)}</Text>
      <Text style={s.colAno}>{l.ano}</Text>
      <Text style={s.colMedia}>{num(l.mediana)}</Text>
      <Text style={s.colPos}>{l.posicao}ª de {l.totalComDado}</Text>
    </View>
  );
}

/** Gráfico de colunas simples, desenhado com caixas */
function Colunas({ serie }: { serie: SerieGrafico }) {
  const max = Math.max(...serie.pontos.map(p => p.valor));
  const altura = 52;
  const ultimo = serie.pontos[serie.pontos.length - 1];
  return (
    <View style={s.grafico} wrap={false}>
      <Text style={{ fontSize: 8, fontWeight: 700 }} wrap={false}>{serie.nome.replace(' de transporte de média e alta capacidade', ' de estações (TMA)')}</Text>
      <Text style={{ fontSize: 7, color: CINZA, marginBottom: 6 }}>{serie.unidade} · {serie.pontos[0].ano}–{ultimo.ano}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: altura }}>
        {serie.pontos.map(p => (
          <View key={p.ano} style={{ flex: 1, marginHorizontal: 0.6, height: Math.max(1, (altura * p.valor) / max), backgroundColor: p === ultimo ? VERDE_ESCURO : VERDE, opacity: p === ultimo ? 1 : 0.55 }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, fontSize: 6.5, color: CINZA }}>
        <Text>{serie.pontos[0].ano}: {num(serie.pontos[0].valor)}</Text>
        <Text>{ultimo.ano}: {num(ultimo.valor)}</Text>
      </View>
    </View>
  );
}

function FichaDocumento({ d, url, logo }: { d: DadosFicha; url: string; logo: string }) {
  const c = d.capital;
  const tma = MODOS_TMA.filter(m => c.tma[m].estacoes || c.tma[m].km);
  return (
    <Document title={`Ficha da cidade — ${c.nome} (${c.uf}) — MobiliDADOS`} author="MobiliDADOS / ITDP Brasil" language="pt-BR">
      <Page size="A4" style={s.pagina}>
        <View style={s.cabecalho}>
          <View style={{ maxWidth: '75%' }}>
            <Text style={s.sobretitulo}>FICHA DA CIDADE</Text>
            <Text style={s.titulo}>{c.nome} ({c.uf})</Text>
            {c.texto ? <Text style={s.sub}>{c.texto}</Text> : null}
            <Text style={s.sub}>Dados atualizados em {data(d.dadosAtualizadosEm)} · Ficha gerada em {data(d.geradaEm)}</Text>
          </View>
          <Image src={logo} style={s.logo} />
        </View>

        <Text style={s.secao}>Informações gerais</Text>
        <View style={s.grade}>
          <Item valor={`${num(c.area)} km²`} rotulo="Área" />
          <Item valor={num(c.pop2016, 0)} rotulo="População (2016)" />
          <Item valor={`${num(c.densidadeUrbana, 0)} hab/km²`} rotulo="Densidade urbana" />
          <Item valor={`${num(c.idhm, 3)}${c.faixaIdhm ? ` (${c.faixaIdhm})` : ''}`} rotulo="IDHM" />
          <Item valor={`R$ ${num(c.renda, 0)}`} rotulo="Renda média domiciliar per capita" />
          <Item valor={pct(c.percDr1sm)} rotulo="Domicílios com renda abaixo de 1 salário mínimo per capita" />
          <Item valor={pct(c.percNegros)} rotulo="População negra" />
          <Item valor={pct(c.percMulheres)} rotulo="Mulheres na população" />
          <Item valor={pct(c.percHomens)} rotulo="Homens na população" />
        </View>

        <Text style={s.secao}>Mobilidade</Text>
        <View style={s.grade}>
          <Item valor={valido(c.laiContratoPrazo) ? c.laiContratoPrazo : c.laiContrato || 'sem dado'} rotulo={valido(c.laiContratoInicio) ? `Contrato de concessão dos ônibus (desde ${c.laiContratoInicio})` : 'Contrato de concessão dos ônibus'} />
          <Item valor={valido(c.laiGpsFrota) && c.laiGpsFrota !== c.laiGps ? c.laiGpsFrota : c.laiGps || 'sem dado'} rotulo="Frota de ônibus com GPS" />
          <Item valor={c.laiGtfs || 'sem dado'} rotulo="Dados abertos de horários (GTFS)" />
          <Item valor={valido(c.planmobAno) ? `${c.planmobStatus} (${c.planmobAno})` : c.planmobStatus || 'sem dado'} rotulo="Plano de mobilidade" />
          {tma.length
            ? tma.map(m => <Item key={m} valor={`${num(c.tma[m].estacoes, 0)} estações · ${num(c.tma[m].km)} km`} rotulo={`Rede de ${NOME_MODO[m]}`} />)
            : <Item valor="Não possui" rotulo="Rede de transporte de média e alta capacidade" />}
        </View>
        <Text style={s.nota}>
          Fontes informadas na base: {[c.laiContratoFonte, c.laiGpsFonte, c.laiGtfsFonte, c.planmobFonte].filter(valido).join(' · ') || '—'} · Rede de média e alta capacidade: ITDP Brasil.
        </Text>

        <Text style={s.secao}>Evolução de indicadores selecionados</Text>
        <View style={s.graficos}>
          {d.series.map(serie => <Colunas key={serie.codigo} serie={serie} />)}
        </View>

        <View style={s.rodape} fixed>
          <Text>MobiliDADOS · ITDP Brasil · Licença CC BY 4.0 · {url}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={s.pagina}>
        <Text style={[s.secao, { marginTop: 0 }]}>Indicadores — valor mais recente e comparação com as capitais</Text>
        <View style={[s.linha, { borderBottom: `1 solid ${CINZA}` }]}>
          <Text style={[s.cab, s.colNome]}>Indicador</Text>
          <Text style={[s.cab, s.colUnid]}>Unidade</Text>
          <Text style={[s.cab, s.colValor]}>{c.nome}</Text>
          <Text style={[s.cab, s.colAno]}>Ano</Text>
          <Text style={[s.cab, s.colMedia]}>Mediana*</Text>
          <Text style={[s.cab, s.colPos]}>Posição*</Text>
        </View>
        {d.secoes.map(sec => (
          <View key={sec.titulo}>
            <Text style={s.subtema} minPresenceAhead={60}>{sec.titulo}</Text>
            <View style={s.tabela}>{sec.linhas.map(l => <Linha key={l.codigo} l={l} />)}</View>
          </View>
        ))}
        {d.semDado.length > 0 && (
          <Text style={s.nota}>Sem dado para {c.nome} na base atual: {[...new Set(d.semDado)].join('; ')}.</Text>
        )}

        <View style={s.caixaNota} wrap={false}>
          <Text style={{ fontWeight: 700, marginBottom: 3 }}>Como ler esta ficha</Text>
          <Text>• Cada valor é o mais recente disponível para {c.nome}; o ano aparece entre parênteses.</Text>
          <Text>• *Posição: ordem entre as capitais com dado no mesmo ano, do maior para o menor valor (1ª = maior valor). A posição não indica se o resultado é bom ou ruim.</Text>
          <Text>• *Mediana: valor do meio entre as capitais com dado no mesmo ano (metade das capitais está acima e metade abaixo). Usamos a mediana porque ela não é distorcida por um único valor muito alto ou muito baixo.</Text>
          <Text>• Esta ficha é gerada automaticamente a partir da base de dados da MobiliDADOS e não contém análise. Metodologia e fontes de cada indicador: ficha metodológica da MobiliDADOS.</Text>
          <Link src={url} style={{ color: VERDE_ESCURO, marginTop: 3 }}>Dados completos e séries históricas: {url}</Link>
        </View>

        <View style={s.rodape} fixed>
          <Text>MobiliDADOS · ITDP Brasil · Licença CC BY 4.0 · {url}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

/** PDF da ficha de uma capital, como bytes */
export function gerarFichaPdf(d: DadosFicha, url: string): Promise<Buffer> {
  return renderToBuffer(<FichaDocumento d={d} url={url} logo={join(RAIZ, 'public/img/logo-mobilidados.png')} />);
}
