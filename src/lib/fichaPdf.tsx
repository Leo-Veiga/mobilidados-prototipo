/* Ficha da cidade em PDF (protótipo), gerada no build com @react-pdf/renderer.
   Todos os textos são modelos fixos preenchidos com os dados de lib/ficha.ts. */
import { join } from 'node:path';
import { Document, Font, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { DadosFicha, LinhaIndicador, SerieGrafico } from './ficha';
import { MODOS_TMA, type TextoAno, type ValorAno } from './tipos';

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
/** Valor de indicador: sempre com 1 casa decimal, como no site */
const dado = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? 'sem dado' : v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Percentual de 0 a 100 de um dado da ficha */
const pct = (v: ValorAno) => (v == null ? 'sem dado' : `${num(v.valor, 1)}%`);
/** Rótulo com o ano do dado: "População (2026)" */
const comAno = (rotulo: string, v: { ano: number } | null | undefined) => (v ? `${rotulo} (${v.ano})` : rotulo);
const data = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
const valido = (v: string | undefined) => Boolean(v) && !['-', 'NA', 'N/A'].includes(v!.trim());
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
      <Text style={s.colValor}>{dado(l.valor)}</Text>
      <Text style={s.colAno}>{l.ano}</Text>
      <Text style={s.colMedia}>{dado(l.mediana)}</Text>
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
        <Text>{serie.pontos[0].ano}: {dado(serie.pontos[0].valor)}</Text>
        <Text>{ultimo.ano}: {dado(ultimo.valor)}</Text>
      </View>
    </View>
  );
}

function FichaDocumento({ d, url, logo }: { d: DadosFicha; url: string; logo: string }) {
  const c = d.capital;
  const v = d.valores;
  const mob = c.mobilidade;
  const tma = MODOS_TMA.filter(m => d.tma.modos[m] || c.tmaKm[m]);
  const contrato = [mob.CONTRATO_INICIO && `desde ${mob.CONTRATO_INICIO.valor}`, mob.CONTRATO_PRAZO?.valor].filter(Boolean).join(', ');
  const texto = (t: TextoAno | undefined, detalhe?: string) => (t ? (detalhe ? `${t.valor} (${detalhe})` : t.valor) : 'sem dado');
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
          <Item valor={num(v.POP?.valor, 0)} rotulo={comAno('População', v.POP)} />
          <Item valor={`${num(v.AREA_KM2?.valor)} km²`} rotulo={comAno('Área', v.AREA_KM2)} />
          <Item valor={`${num(v.DENS_URB?.valor, 0)} hab/km²`} rotulo={comAno('Densidade urbana', v.DENS_URB)} />
          <Item valor={`${num(c.idhm, 3)}${c.faixaIdhm ? ` (${c.faixaIdhm})` : ''}`} rotulo="IDHM (2010)" />
          <Item valor={`R$ ${num(v.RENDA_MED_PC?.valor, 0)}`} rotulo={comAno('Renda média domiciliar per capita', v.RENDA_MED_PC)} />
          <Item valor={pct(v.PERC_ATE_1SM_PC)} rotulo={comAno('Moradores com renda domiciliar per capita até 1 salário mínimo', v.PERC_ATE_1SM_PC)} />
          <Item valor={pct(v.PERC_NEGROS)} rotulo={comAno('População negra', v.PERC_NEGROS)} />
          <Item valor={pct(v.PERC_MULHERES)} rotulo={comAno('Mulheres na população', v.PERC_MULHERES)} />
          <Item valor={pct(v.PERC_HOMENS)} rotulo={comAno('Homens na população', v.PERC_HOMENS)} />
        </View>

        <Text style={s.secao}>Mobilidade</Text>
        <View style={s.grade}>
          <Item valor={texto(mob.CONTRATO, contrato)} rotulo={comAno('Ônibus com contrato licitado', mob.CONTRATO)} />
          <Item valor={texto(mob.GPS_PUBLICO, mob.GPS_FROTA && `${mob.GPS_FROTA.valor} da frota com GPS`)} rotulo={comAno('GPS dos ônibus público', mob.GPS_PUBLICO)} />
          <Item valor={texto(mob.GTFS_PUBLICO)} rotulo={comAno('Dados abertos de horários (GTFS)', mob.GTFS_PUBLICO)} />
          <Item valor={texto(mob.PLANMOB_STATUS, mob.PLANMOB_ANO && `de ${mob.PLANMOB_ANO.valor}`)} rotulo={comAno('Plano de mobilidade', mob.PLANMOB_STATUS)} />
          {tma.length
            ? tma.map(m => (
              <Item
                key={m} rotulo={`Rede de ${NOME_MODO[m]}`}
                valor={`${num(d.tma.modos[m] ?? 0, 0)} estações${d.tma.ano ? ` (${d.tma.ano})` : ''}${c.tmaKm[m] ? ` · ${num(c.tmaKm[m])} km` : ''}`}
              />
            ))
            : <Item valor="Não possui" rotulo="Rede de transporte de média e alta capacidade" />}
        </View>
        <Text style={s.nota}>
          Fontes informadas na base: {[mob.CONTRATO, mob.GPS_PUBLICO, mob.GTFS_PUBLICO, mob.PLANMOB_STATUS].map(t => t?.fonte).filter(valido).join(' · ') || '—'} · Rede de média e alta capacidade: ITDP Brasil (extensão em km sem ano informado).
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
