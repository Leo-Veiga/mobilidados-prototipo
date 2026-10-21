/* Ficha da cidade em PDF (protótipo), gerada no build com @react-pdf/renderer.
   Todos os textos são modelos fixos preenchidos com os dados de lib/ficha.ts. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Circle, Document, Font, Image, Link, Page, Path, Polyline, Rect, StyleSheet, Svg, Text, View, renderToBuffer } from '@react-pdf/renderer';
import mapa from '@/data/mapa-brasil.json';
import type { ComparacaoGrafico, DadosFicha, DivisaoModal, LinhaIndicador, SerieGrafico } from './ficha';
import { ICONE, ICONE_INDICADOR, ICONE_TEMA } from './iconesPdf';
import type { Capital, TextoAno, ValorAno } from './tipos';


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
const VERDE_CLARO = '#7be0a8';
/** Posição do melhor para o pior; "—" para indicador sem avaliação */
const posicao = (l: LinhaIndicador) => (l.posicao === 0 ? 'sem TMA***' : l.avaliacao ? `${l.posicao}ª de ${l.totalComDado}` : '—');

const s = StyleSheet.create({
  pagina: { fontFamily: 'Open Sans', fontSize: 9, color: '#0e110f', padding: '36 40 56 40' },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: VERDE_ESCURO, margin: '-36 -40 12 -40', padding: '18 40' },
  sobretitulo: { fontSize: 8, color: VERDE_CLARO, fontWeight: 700, letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: 700, marginTop: 1, color: '#ffffff' },
  sub: { fontSize: 8, color: '#e3f5ea', marginTop: 3 },
  logo: { width: 121, height: 48, flexShrink: 0 },
  secao: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  secaoTexto: { fontSize: 12, fontWeight: 700, color: VERDE_ESCURO, marginLeft: 5 },
  destaques: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  destaque: { width: '23.8%', backgroundColor: FUNDO_CLARO, borderLeft: `3 solid ${VERDE}`, borderRadius: 3, padding: '6 7' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: FUNDO_CLARO, borderRadius: 4, padding: 8 },
  item: { width: '33.33%', padding: 3 },
  itemValor: { fontSize: 12, fontWeight: 700 },
  itemRotulo: { fontSize: 7.5, color: CINZA },
  nota: { fontSize: 7.5, color: CINZA, marginTop: 4 },
  tabela: { borderTop: `1 solid ${CINZA_CLARO}` },
  linha: { flexDirection: 'row', borderBottom: `1 solid ${CINZA_CLARO}`, paddingVertical: 3.5, alignItems: 'center' },
  cab: { fontSize: 7.5, fontWeight: 700, color: CINZA },
  colNome: { width: '40%', paddingRight: 6 },
  colUnid: { width: '17%', color: CINZA, fontSize: 7.5 },
  colValor: { width: '11%', textAlign: 'right', fontWeight: 700 },
  colAno: { width: '8%', textAlign: 'right', color: CINZA },
  colMedia: { width: '11%', textAlign: 'right' },
  colPos: { width: '13%', textAlign: 'right' },
  subtema: { fontSize: 9, fontWeight: 700, marginTop: 8, marginBottom: 2 },
  graficos: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8 },
  grafico: { width: '23.8%', marginBottom: 7, padding: 6, border: `1 solid ${CINZA_CLARO}`, borderRadius: 4 },
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
/** "https://www.recife.pe.gov.br/x/y" -> "recife.pe.gov.br" (texto que não é endereço fica como está) */
const dominio = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const curto = (nome: string) => nome.replace(' de transporte de média e alta capacidade', ' de estações (TMA)');

/** Ícone 24×24 (lib/iconesPdf.ts) no tamanho e cor pedidos */
function Icone({ d, tamanho = 12, cor = VERDE_ESCURO }: { d: string; tamanho?: number; cor?: string }) {
  return <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24"><Path d={d} fill={cor} /></Svg>;
}

/** Título de seção com ícone */
function Secao({ icone, children, topo }: { icone: string; children: string; topo?: boolean }) {
  return (
    <View style={[s.secao, topo ? { marginTop: 0 } : {}]} minPresenceAhead={80}>
      <Icone d={icone} />
      <Text style={s.secaoTexto}>{children}</Text>
    </View>
  );
}

/** Mapinha do Brasil (mesmo desenho da busca do site) com o local marcado */
function Mapinha({ c }: { c: { lat: number | null; lon: number | null } }) {
  const ponto = c.lat != null && c.lon != null
    ? { x: (c.lon - mapa.lonMin) * mapa.cos * mapa.escala, y: (mapa.latMax - c.lat) * mapa.escala }
    : null;
  return (
    <Svg width={62} height={55} viewBox={`0 0 ${mapa.largura} ${mapa.altura}`} style={{ marginRight: 14 }}>
      {mapa.estados.map(e => <Path key={e.uf} d={e.d} fill="#ffffff" fillOpacity={0.16} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={5} />)}
      {ponto && <Circle cx={ponto.x} cy={ponto.y} r={55} fill={VERDE_CLARO} stroke="#ffffff" strokeWidth={16} />}
    </Svg>
  );
}

/** Cartão de destaque: valor mais recente e posição em relação à mediana das capitais */
function Destaque({ l, grupo }: { l: LinhaIndicador; grupo: string }) {
  return (
    <View style={s.destaque}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icone d={ICONE_INDICADOR[l.codigo] ?? ICONE.grafico} tamanho={9} />
        <Text style={{ fontSize: 6.5, color: CINZA, marginLeft: 3, maxWidth: '88%' }}>{curto(l.nome)}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{dado(l.valor)}</Text>
      <Text style={{ fontSize: 6.5, color: CINZA }}>{l.unidade} · {l.ano}</Text>
      <Text style={{ fontSize: 6.5, marginTop: 2 }}>
        <Text style={{ fontWeight: 700, color: VERDE_ESCURO }}>{l.posicao === 0 ? 'sem rede de TMA' : l.avaliacao ? `${l.posicao}ª de ${l.totalComDado} ${grupo}` : ''}</Text>
        <Text style={{ color: CINZA }}> · mediana {dado(l.mediana)}</Text>
      </Text>
    </View>
  );
}

const COR_MODO = [VERDE_ESCURO, VERDE, VERDE_CLARO, '#b9c3bd'];

/** Divisão modal: barra empilhada e legenda com os percentuais */
function Modal({ m }: { m: DivisaoModal }) {
  return (
    <View style={[s.grade, { flexDirection: 'column' }]}>
      <View style={{ flexDirection: 'row', height: 12, borderRadius: 2, overflow: 'hidden', margin: '2 3 6 3' }}>
        {m.modos.map((x, i) => <View key={x.nome} style={{ width: `${x.valor}%`, backgroundColor: COR_MODO[i] }} />)}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {m.modos.map((x, i) => (
          <View key={x.nome} style={[s.item, { width: '25%', flexDirection: 'row', alignItems: 'flex-start' }]}>
            <View style={{ width: 7, height: 7, backgroundColor: COR_MODO[i], marginTop: 4, marginRight: 4 }} />
            <View>
              <Text style={s.itemValor}>{dado(x.valor)}%</Text>
              <Text style={s.itemRotulo}>{x.nome}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Item({ valor, rotulo, largura }: { valor: string; rotulo: string; largura?: string }) {
  return (
    <View style={[s.item, largura ? { width: largura } : {}]}>
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
      <Text style={s.colPos}>{posicao(l)}</Text>
    </View>
  );
}

/** Gráfico de colunas com a mediana das capitais em linha tracejada */
function Colunas({ serie }: { serie: SerieGrafico }) {
  const L = 108, A = 44;
  const pts = serie.pontos;
  const max = Math.max(...pts.flatMap(p => [p.valor, p.mediana])) || 1;
  const bw = L / pts.length;
  const y = (v: number) => A - (A * v) / max;
  const ultimo = pts[pts.length - 1];
  return (
    <View style={s.grafico} wrap={false}>
      <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{curto(serie.nome)}</Text>
      <Text style={{ fontSize: 6.5, color: CINZA, marginBottom: 5 }}>{serie.unidade} · {pts[0].ano}–{ultimo.ano}</Text>
      <Svg width={L} height={A} viewBox={`0 0 ${L} ${A}`}>
        {pts.map((p, i) => (
          <Rect key={p.ano} x={i * bw + 0.4} y={y(p.valor)} width={Math.max(0.5, bw - 0.8)} height={Math.max(0.5, A - y(p.valor))}
            fill={p === ultimo ? VERDE_ESCURO : VERDE} fillOpacity={p === ultimo ? 1 : 0.55} />
        ))}
        <Polyline points={pts.map((p, i) => `${i * bw + bw / 2},${y(p.mediana)}`).join(' ')} fill="none" stroke={CINZA} strokeWidth={0.9} strokeDasharray="2,1.4" />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, fontSize: 6, color: CINZA }}>
        <Text>{pts[0].ano}: {dado(pts[0].valor)}</Text>
        <Text style={{ fontWeight: 700, color: VERDE_ESCURO }}>{ultimo.ano}: {dado(ultimo.valor)}</Text>
      </View>
    </View>
  );
}

/** Barras horizontais: a capital ao lado da mediana e dos extremos entre as capitais */
function Barras({ comp }: { comp: ComparacaoGrafico }) {
  const max = Math.max(...comp.barras.map(b => b.valor));
  return (
    <View style={s.grafico} wrap={false}>
      <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{comp.nome}</Text>
      <Text style={{ fontSize: 6.5, color: CINZA, marginBottom: 6 }}>{comp.unidade} · {comp.ano}</Text>
      {comp.barras.map(b => (
        <View key={b.rotulo} style={{ marginBottom: 3 }}>
          <Text style={{ fontSize: 6, color: b.destaque ? VERDE_ESCURO : CINZA, fontWeight: b.destaque ? 700 : 400 }}>{b.rotulo}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: '80%', height: 6 }}>
              <View style={{ width: `${Math.max(1, (100 * b.valor) / max)}%`, height: 6, backgroundColor: b.destaque ? VERDE_ESCURO : VERDE, opacity: b.destaque ? 1 : 0.55 }} />
            </View>
            <Text style={{ width: '20%', fontSize: 6, textAlign: 'right', fontWeight: b.destaque ? 700 : 400 }}>{dado(b.valor)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Aba Mobilidade da ficha (só capitais) */
function Mobilidade({ c }: { c: Capital }) {
  const mob = c.mobilidade;
  const contrato = [mob.CONTRATO_INICIO && `desde ${mob.CONTRATO_INICIO.valor}`, mob.CONTRATO_PRAZO?.valor].filter(Boolean).join(', ');
  const texto = (t: TextoAno | undefined, detalhe?: string) => (t ? (detalhe ? `${t.valor} (${detalhe})` : t.valor) : 'sem dado');
  return (
    <>
      <Secao icone={ICONE.onibus}>Mobilidade</Secao>
      <View style={s.grade}>
        <Item valor={texto(mob.CONTRATO, contrato)} rotulo={comAno('Ônibus com contrato licitado', mob.CONTRATO)} largura="25%" />
        <Item valor={texto(mob.GPS_PUBLICO, mob.GPS_FROTA && `${mob.GPS_FROTA.valor} da frota com GPS`)} rotulo={comAno('GPS dos ônibus público', mob.GPS_PUBLICO)} largura="25%" />
        <Item valor={texto(mob.GTFS_PUBLICO)} rotulo={comAno('Dados abertos de horários (GTFS)', mob.GTFS_PUBLICO)} largura="25%" />
        <Item valor={texto(mob.PLANMOB_STATUS, mob.PLANMOB_ANO && `de ${mob.PLANMOB_ANO.valor}`)} rotulo={comAno('Plano de mobilidade', mob.PLANMOB_STATUS)} largura="25%" />
      </View>
      <Text style={s.nota}>
        Fontes:{' '}
        {([['Contrato', mob.CONTRATO], ['GPS', mob.GPS_PUBLICO], ['GTFS', mob.GTFS_PUBLICO], ['Plano', mob.PLANMOB_STATUS]] as [string, TextoAno | undefined][])
          .filter(([, t]) => valido(t?.fonte))
          .map(([tema, t], i) => (
            <Text key={tema}>
              {i ? ' · ' : ''}{tema}:{' '}
              {/^https?:\/\//.test(t!.fonte!) ? <Link src={t!.fonte!} style={{ color: VERDE_ESCURO }}>{dominio(t!.fonte!)}</Link> : t!.fonte}
            </Text>
          ))}
      </Text>
    </>
  );
}

function FichaDocumento({ d, url, logo }: { d: DadosFicha; url: string; logo: Buffer }) {
  const c = d.capital;
  const local = d.local;
  /** Nome curto do local, para a tabela e as frases */
  const nome = c ? c.nome : 'sigla' in local ? local.sigla : local.nome;
  /** Grupo de comparação por extenso */
  const grupo = d.nivel === 'capitais' ? 'capitais' : 'regiões metropolitanas';
  const v = d.valores;
  return (
    <Document title={`${c ? 'Ficha da cidade' : 'Ficha da região metropolitana'} — ${d.titulo} — MobiliDADOS`} author="MobiliDADOS / ITDP Brasil" language="pt-BR">
      <Page size="A4" style={s.pagina}>
        <View style={s.cabecalho}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
            <Mapinha c={local} />
            <View style={{ flex: 1 }}>
              <Text style={s.sobretitulo}>{d.sobretitulo}</Text>
              <Text style={[s.titulo, d.titulo.length > 40 ? { fontSize: 14 } : c ? {} : { fontSize: 16 }]}>{d.titulo}</Text>
              {local.texto ? <Text style={s.sub}>{local.texto}</Text> : null}
              <Text style={s.sub}>Dados atualizados em {data(d.dadosAtualizadosEm)} · Ficha gerada em {data(d.geradaEm)}</Text>
            </View>
          </View>
          <Image src={{ data: logo, format: 'png' }} style={s.logo} />
        </View>

        {d.destaques.length > 0 && (
          <>
            <Secao icone={ICONE.grafico} topo>Destaques</Secao>
            <View style={s.destaques}>{d.destaques.map(l => <Destaque key={l.codigo} l={l} grupo={d.grupo} />)}</View>
          </>
        )}

        <Secao icone={ICONE.info}>Informações gerais</Secao>
        <View style={s.grade}>
          <Item valor={num(v.POP?.valor, 0)} rotulo={comAno('População', v.POP)} />
          <Item valor={`${num(v.AREA_KM2?.valor)} km²`} rotulo={comAno('Área', v.AREA_KM2)} />
          <Item valor={`${num(v.DENS_URB?.valor, 0)} hab/km²`} rotulo={comAno('Densidade urbana', v.DENS_URB)} />
          <Item valor={`${num(local.idhm, 3)}${local.faixaIdhm ? ` (${local.faixaIdhm})` : ''}`} rotulo="IDHM (2010)" />
          <Item valor={`R$ ${num(v.RENDA_MED_PC?.valor, 0)}`} rotulo={comAno('Renda média domiciliar per capita', v.RENDA_MED_PC)} />
          <Item valor={pct(v.PERC_ATE_1SM_PC)} rotulo={comAno('Moradores com renda domiciliar per capita até 1 salário mínimo', v.PERC_ATE_1SM_PC)} />
          <Item valor={pct(v.PERC_NEGROS)} rotulo={comAno('População negra', v.PERC_NEGROS)} />
          <Item valor={pct(v.PERC_MULHERES)} rotulo={comAno('Mulheres na população', v.PERC_MULHERES)} />
          <Item valor={pct(v.PERC_HOMENS)} rotulo={comAno('Homens na população', v.PERC_HOMENS)} />
        </View>

        {c && <Mobilidade c={c} />}
        {d.modal && (
          <>
            <Secao icone={ICONE.onibus}>{`Divisão modal — pesquisa origem-destino de ${d.modal.ano}`}</Secao>
            <Modal m={d.modal} />
          </>
        )}

        <Secao icone={ICONE.grafico}>Indicadores selecionados</Secao>
        <Text style={[s.nota, { marginTop: -3, marginBottom: 5 }]}>Barras: {nome}, último ano em destaque. Linha tracejada: mediana das {grupo} no mesmo ano.</Text>
        <View style={s.graficos}>
          {d.series.map(serie => <Colunas key={serie.codigo} serie={serie} />)}
          {d.comparacoes.map(comp => <Barras key={comp.codigo} comp={comp} />)}
        </View>

        <View style={s.rodape} fixed>
          <Text>MobiliDADOS · ITDP Brasil · Licença CC BY 4.0 · {url}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={s.pagina}>
        <Secao icone={ICONE.grafico} topo>{`Indicadores — valor mais recente e comparação com as ${grupo}`}</Secao>
        <View style={[s.linha, { borderBottom: `1 solid ${CINZA}` }]}>
          <Text style={[s.cab, s.colNome]}>Indicador</Text>
          <Text style={[s.cab, s.colUnid]}>Unidade</Text>
          <Text style={[s.cab, s.colValor]}>{nome}</Text>
          <Text style={[s.cab, s.colAno]}>Ano</Text>
          <Text style={[s.cab, s.colMedia]}>Mediana*</Text>
          <Text style={[s.cab, s.colPos]}>Posição**</Text>
        </View>
        {d.secoes.map(sec => (
          <View key={sec.titulo}>
            {/* Título preso à primeira linha, para não ficar sozinho no pé da página */}
            <View wrap={false}>
              <View style={[s.subtema, { flexDirection: 'row', alignItems: 'center' }]}>
                {ICONE_TEMA[sec.titulo] && <Icone d={ICONE_TEMA[sec.titulo]} tamanho={9} />}
                <Text style={{ marginLeft: 4 }}>{sec.titulo}</Text>
              </View>
              <View style={s.tabela}><Linha l={sec.linhas[0]} /></View>
            </View>
            {sec.linhas.slice(1).map(l => <Linha key={l.codigo} l={l} />)}
          </View>
        ))}
        {d.semDado.length > 0 && (
          <Text style={s.nota}>Sem dado para {nome} na base atual: {[...new Set(d.semDado)].join('; ')}.</Text>
        )}

        <View style={s.caixaNota} wrap={false}>
          <Text style={{ fontWeight: 700, marginBottom: 3 }}>Como ler esta ficha</Text>
          <Text>• Cada valor é o mais recente disponível para {nome}; o ano aparece entre parênteses.</Text>
          <Text>• *Mediana: valor do meio entre as {grupo} com dado no mesmo ano (metade está acima e metade abaixo). Usamos a mediana porque ela não é distorcida por um único valor muito alto ou muito baixo.</Text>
          <Text>• **Posição: ordem entre as {grupo} com dado no mesmo ano, do melhor para o pior resultado (1ª = melhor). Melhor é o menor valor em mortes, internações, tempo de viagem, motorização, emissões, tarifa e viagens de transporte individual, e o maior valor nos demais. "—" = indicador sem avaliação de melhor ou pior (como o % de negros entre as mortes, que depende do perfil da população).</Text>
          <Text>• ***PNT: a mediana e a posição consideram só as {grupo} com rede de transporte de média e alta capacidade (TMA); as demais têm 0 e ficam fora da comparação.</Text>
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

// Lido como bytes: no Windows o react-pdf não abre caminhos do tipo C:\...
const LOGO = readFileSync(join(RAIZ, 'public/img/logo-mobilidados.png')); // branco, sobre a faixa verde

/** PDF da ficha de uma capital ou região metropolitana, como bytes */
export function gerarFichaPdf(d: DadosFicha, url: string): Promise<Buffer> {
  return renderToBuffer(<FichaDocumento d={d} url={url} logo={LOGO} />);
}
