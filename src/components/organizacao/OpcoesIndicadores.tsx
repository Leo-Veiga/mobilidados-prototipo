'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Abas from '@/components/Abas';
import Grafico, { PALETA, type ConfigGrafico } from '@/components/Grafico';
import MultiSelect from '@/components/MultiSelect';
import { TEMAS, type IndicadorPrincipal } from '@/lib/organizacao';
import type { Nivel, Serie } from '@/lib/tipos';
import styles from './Organizacao.module.css';

export interface DadosOpcoes {
  /** nível -> código (o das capitais) -> slug do local -> série */
  series: Record<Nivel, Record<string, Record<string, Serie>>>;
  locais: Record<Nivel, { slug: string; nome: string; curto?: string }[]>;
  /** código -> slug da página do indicador */
  links: Record<string, string>;
  nomes: Record<string, { nome: string; unidade: string }>;
}

type Opcao = 'op1' | 'op2' | 'op3';
const ABAS = [
  { id: 'op1' as const, titulo: 'Opção 1 · Tema › indicador › recorte' },
  { id: 'op2' as const, titulo: 'Opção 2 · Tudo visível, hierarquizado' },
  { id: 'op3' as const, titulo: 'Opção 3 · Por pergunta' },
];
const TODOS = TEMAS.flatMap(t => t.indicadores);
const nbsp = ' ';

function Explicacao({ como, pros, contras }: { como: string; pros: string; contras: string }) {
  return (
    <div className={styles.explicacao}>
      <p><strong>Como funciona:</strong> {como}</p>
      <p><strong>Prós:</strong> {pros}</p>
      <p><strong>Contras:</strong> {contras}</p>
    </div>
  );
}

/** Opção 1: lista curta (12 indicadores) e os recortes como botões dentro do indicador */
function Opcao1({ d, ind, setInd }: { d: DadosOpcoes; ind: IndicadorPrincipal; setInd: (i: IndicadorPrincipal) => void }) {
  // Locais escolhidos, como "capitais:recife" ou "rms:rmr" (dá para misturar capitais e RMs)
  const [locais, setLocais] = useState<string[]>(['capitais:recife']);
  const [recorte, setRecorte] = useState(0); // 0 = total
  const [categoria, setCategoria] = useState(0); // parte do recorte comparada quando há vários locais
  const [de, setDe] = useState<string | null>(null);
  const [ate, setAte] = useState<string | null>(null);

  const opcoesLocais = useMemo(() => (['capitais', 'rms'] as Nivel[]).flatMap(n =>
    d.locais[n].map(l => ({ valor: `${n}:${l.slug}`, rotulo: n === 'capitais' ? l.nome : `RM ${l.curto ?? l.nome}`, grupo: n === 'capitais' ? 'Capitais' : 'Regiões metropolitanas' }))), [d]);
  const nomeDe = (k: string) => opcoesLocais.find(o => o.valor === k)?.rotulo ?? k;
  const serieDe = (k: string, codigo: string) => {
    const [n, slug] = k.split(':') as [Nivel, string];
    return d.series[n][codigo]?.[slug] ?? {};
  };

  const todasPartes: [string, string][] = recorte === 0 ? [[ind.principal, 'Total']] : ind.recortes[recorte - 1]?.partes ?? [[ind.principal, 'Total']];
  const varios = locais.length > 1;
  const cat = Math.min(categoria, todasPartes.length - 1);
  // Com um local: uma linha por categoria do recorte. Com vários: uma linha por local, numa categoria escolhida.
  const partes = varios ? [todasPartes[cat]] : todasPartes;
  const linhas = varios
    ? locais.map(k => ({ rotulo: nomeDe(k), serie: serieDe(k, partes[0][0]) }))
    : partes.map(([c, r]) => ({ rotulo: r, serie: serieDe(locais[0] ?? '', c) }));

  const todosAnos = [...new Set(linhas.flatMap(l => Object.keys(l.serie)))].sort();
  const ini = de && todosAnos.includes(de) ? de : todosAnos[0];
  const fim = ate && todosAnos.includes(ate) && ate >= ini ? ate : todosAnos[todosAnos.length - 1];
  const anos = todosAnos.filter(a => a >= ini && a <= fim);
  const chave = `${ind.id}|${recorte}|${cat}|${locais.join()}|${anos.join()}`;

  const config = useMemo(() => ({
    type: anos.length > 1 ? 'line' : 'bar',
    data: {
      labels: anos,
      datasets: linhas.map((l, i) => ({
        label: l.rotulo, data: anos.map(a => l.serie[a] ?? null),
        borderColor: PALETA[i % PALETA.length], backgroundColor: PALETA[i % PALETA.length], spanGaps: true, tension: 0.2, pointRadius: 3,
      })),
    },
    options: { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } } } },
  } as unknown as ConfigGrafico), [chave]); // eslint-disable-line react-hooks/exhaustive-deps

  const temRm = locais.some(k => k.startsWith('rms:'));
  const soCapitais = (i: IndicadorPrincipal) => !Object.keys(d.series.rms[i.principal] ?? {}).length;
  const semDado = linhas.filter(l => !Object.keys(l.serie).length).map(l => l.rotulo);
  const un = d.nomes[partes[0][0]]?.unidade;
  const periodo = ini === fim ? ini : `${ini}–${fim}`;
  const titulo = varios ? `${ind.nome}${todasPartes.length > 1 || recorte ? ` — ${partes[0][1]}` : ''}` : ind.nome;
  const legendaLocais = varios ? `${locais.length} locais` : nomeDe(locais[0] ?? '');

  return (
    <>
      <Explicacao
        como="a lista mostra só os 12 indicadores principais, agrupados por tema. Dentro da página do indicador, os recortes viram botões e o gráfico troca sem sair da página."
        pros="lista curta; o recorte aparece junto do total, no mesmo gráfico; fácil comparar grupos e locais."
        contras="quem procura um recorte específico precisa entrar no indicador; é a mudança mais trabalhosa."
      />
      <div className={styles.filtros}>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Indicador (lista suspensa nova)</span>
          <select className={styles.select} value={ind.id} onChange={e => { setInd(TODOS.find(i => i.id === e.target.value)!); setRecorte(0); setCategoria(0); }}>
            {TEMAS.map(t => (
              <optgroup key={t.id} label={t.nome}>
                {t.indicadores.map(i => <option key={i.id} value={i.id}>{i.nome}{soCapitais(i) ? ' (só capitais)' : ''}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <div className={styles.grupo}>
          <label className={styles.rotulo} htmlFor="op1-locais">Capitais e regiões metropolitanas</label>
          <div className={styles.multi}>
            <MultiSelect id="op1-locais" opcoes={opcoesLocais} selecionados={locais} aoMudar={setLocais} placeholder="Escolha um ou mais locais" escuro />
          </div>
        </div>
        {todosAnos.length > 1 && (
          <div className={styles.grupo}>
            <span className={styles.rotulo}>Anos</span>
            <div className={styles.anos}>
              <select className={styles.selectAno} aria-label="Ano inicial" value={ini} onChange={e => setDe(e.target.value)}>
                {todosAnos.map(a => <option key={a}>{a}</option>)}
              </select>
              <span>a</span>
              <select className={styles.selectAno} aria-label="Ano final" value={fim} onChange={e => setAte(e.target.value)}>
                {todosAnos.filter(a => a >= ini).map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className={styles.pagina}>
        <p className={styles.tema}>{TEMAS.find(t => t.indicadores.includes(ind))?.nome}</p>
        <h3 className={styles.h3}>{ind.nome}</h3>
        {ind.recortes.length > 0 && (
          <div className={styles.botoes} role="radiogroup" aria-label="Recorte">
            {['Total', ...ind.recortes.map(r => r.nome)].map((r, i) => (
              <button key={r} type="button" role="radio" aria-checked={recorte === i} className={styles.opcao} onClick={() => { setRecorte(i); setCategoria(0); }}>{r}</button>
            ))}
          </div>
        )}
        {varios && todasPartes.length > 1 && (
          <label className={`${styles.grupo} ${styles.categoria}`}>
            <span className={styles.rotulo}>Com vários locais, compare uma categoria por vez</span>
            <select className={styles.select} value={cat} onChange={e => setCategoria(Number(e.target.value))}>
              {todasPartes.map(([, r], i) => <option key={r} value={i}>{r}</option>)}
            </select>
          </label>
        )}
        <p className="nota">{legendaLocais}{un ? ` · ${un}` : ''}{anos.length ? ` · ${periodo}` : ''}</p>
        {!locais.length
          ? <p className={styles.vazio}>Escolha pelo menos um local.</p>
          : anos.length
            ? <Grafico config={config} altura={320} valores descricao={`${titulo}: ${locais.map(nomeDe).join(', ')}`} imagem={{ titulo, subtitulo: `${locais.map(nomeDe).join(', ')} · ${periodo}` }} />
            : <p className={styles.vazio}>Sem dados deste recorte para {legendaLocais}{temRm ? ' (alguns indicadores existem só para as capitais)' : ''}.</p>}
        {anos.length > 0 && semDado.length > 0 && (
          <p className="nota">Sem dados para: {semDado.join(', ')}{temRm ? ' (alguns indicadores existem só para as capitais)' : ''}.</p>
        )}
      </div>
    </>
  );
}

/** Opção 2: todos os 42 itens continuam, mas agrupados e com o principal à frente dos recortes */
function Opcao2({ d }: { d: DadosOpcoes }) {
  const nome = (c: string) => d.nomes[c]?.nome ?? c;
  const link = (c: string) => (d.links[c] ? `/indicadores/${d.links[c]}/` : '#');
  return (
    <>
      <Explicacao
        como="todos os indicadores e recortes continuam na lista, mas agrupados por tema, com o principal primeiro e os recortes recuados embaixo. A página de indicadores vira cartões por tema."
        pros="nada fica escondido; mudança pequena e rápida; as páginas e links atuais continuam iguais."
        contras="a lista continua longa (42 itens), só fica mais fácil de ler."
      />
      <label className={styles.grupo}>
        <span className={styles.rotulo}>Lista suspensa reorganizada</span>
        <select className={styles.select} defaultValue="">
          <option value="" disabled>Escolha um indicador</option>
          {TEMAS.map(t => (
            <optgroup key={t.id} label={t.nome}>
              {t.indicadores.flatMap(i => [
                <option key={i.id} value={i.principal}>{i.nome}</option>,
                ...i.recortes.flatMap(r => r.partes.filter(([, rot]) => rot !== 'População total').map(([c, rot]) => (
                  <option key={i.id + c} value={c}>{nbsp.repeat(6)}— {rot}</option>
                ))),
              ])}
            </optgroup>
          ))}
        </select>
      </label>
      <div className={styles.cartoes}>
        {TEMAS.map(t => (
          <div key={t.id} className={styles.cartao}>
            <p className={styles.tema}>{t.nome}</p>
            {t.indicadores.map(i => (
              <div key={i.id} className={styles.item}>
                <Link href={link(i.principal)} className={styles.principal}>{i.nome}</Link>
                {i.recortes.map(r => {
                  const partes = r.partes.filter(([, rot]) => rot !== 'População total');
                  return partes.length > 0 && (
                    <p key={r.nome} className={styles.recortes}>
                      <span>{r.nome}:</span>{' '}
                      {partes.map(([c, rot], k) => <span key={c}>{k > 0 && ' · '}<Link href={link(c)}>{rot}</Link></span>)}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="nota">Os links levam às páginas de indicador que já existem. Exemplo de recorte: {nome('TX_MORT_PED')}.</p>
    </>
  );
}

/** Opção 3: entrada por perguntas; cada pergunta abre o indicador principal do tema (na opção 1) */
function Opcao3({ abrir }: { abrir: (i: IndicadorPrincipal) => void }) {
  return (
    <>
      <Explicacao
        como="os temas viram perguntas em linguagem simples, como porta de entrada na página inicial ou no topo da página de indicadores. Cada pergunta abre o indicador principal; por baixo, funciona a opção 1 ou a 2."
        pros="fala a língua de gestores e imprensa; conversa com a estratégia de comunicação e com os destaques."
        contras="sozinha não resolve a lista suspensa; precisa de uma das outras por baixo."
      />
      <div className={styles.perguntas}>
        {TEMAS.map(t => (
          <button key={t.id} type="button" className={styles.pergunta} onClick={() => abrir(t.indicadores[0])}>
            <strong>{t.pergunta}</strong>
            <span>{t.indicadores.map(i => i.nome).join(' · ')}</span>
            <em>Ver dados →</em>
          </button>
        ))}
      </div>
      <p className="nota">Clique numa pergunta: ela abre o indicador na opção 1.</p>
    </>
  );
}

export default function OpcoesIndicadores({ d }: { d: DadosOpcoes }) {
  const [aba, setAba] = useState<Opcao>('op1');
  const [ind, setInd] = useState<IndicadorPrincipal>(TODOS[0]);
  return (
    <Abas abas={ABAS} ativa={aba} aoMudar={setAba} rotulo="Opções de organização">
      {aba === 'op1' && <Opcao1 d={d} ind={ind} setInd={setInd} />}
      {aba === 'op2' && <Opcao2 d={d} />}
      {aba === 'op3' && <Opcao3 abrir={i => { setInd(i); setAba('op1'); }} />}
    </Abas>
  );
}
