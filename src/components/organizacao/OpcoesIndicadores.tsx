'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Abas from '@/components/Abas';
import Grafico, { PALETA, type ConfigGrafico } from '@/components/Grafico';
import { TEMAS, type IndicadorPrincipal } from '@/lib/organizacao';
import type { Nivel, Serie } from '@/lib/tipos';
import styles from './Organizacao.module.css';

export interface DadosOpcoes {
  /** nível -> código (o das capitais) -> slug do local -> série */
  series: Record<Nivel, Record<string, Record<string, Serie>>>;
  locais: Record<Nivel, { slug: string; nome: string }[]>;
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
  const [nivel, setNivel] = useState<Nivel>('capitais');
  const [local, setLocal] = useState('recife');
  const [recorte, setRecorte] = useState(0); // 0 = total
  const [de, setDe] = useState<string | null>(null);
  const [ate, setAte] = useState<string | null>(null);
  const partes: [string, string][] = recorte === 0 ? [[ind.principal, 'Total']] : ind.recortes[recorte - 1]?.partes ?? [[ind.principal, 'Total']];
  const series = d.series[nivel];
  const nomeLocal = d.locais[nivel].find(c => c.slug === local)?.nome ?? '';
  const temDado = (i: IndicadorPrincipal) => Object.keys(series[i.principal] ?? {}).length > 0;

  // Anos com dado para o local e o recorte escolhidos; o intervalo "de/até" fica dentro deles
  const todosAnos = [...new Set(partes.flatMap(([c]) => Object.keys(series[c]?.[local] ?? {})))].sort();
  const ini = de && todosAnos.includes(de) ? de : todosAnos[0];
  const fim = ate && todosAnos.includes(ate) && ate >= ini ? ate : todosAnos[todosAnos.length - 1];
  const anos = todosAnos.filter(a => a >= ini && a <= fim);
  const chave = `${ind.id}|${recorte}|${nivel}|${local}|${anos.join()}`;

  const config = useMemo(() => ({
    type: anos.length > 1 ? 'line' : 'bar',
    data: {
      labels: anos,
      datasets: partes.map(([c, r], i) => ({
        label: r, data: anos.map(a => series[c]?.[local]?.[a] ?? null),
        borderColor: PALETA[i], backgroundColor: PALETA[i], spanGaps: true, tension: 0.2, pointRadius: 3,
      })),
    },
    options: { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { grid: { display: false } } } },
  } as unknown as ConfigGrafico), [chave]); // eslint-disable-line react-hooks/exhaustive-deps

  function mudarNivel(n: Nivel) {
    setNivel(n);
    setLocal(n === 'capitais' ? 'recife' : d.locais.rms.find(r => /recife/i.test(r.nome))?.slug ?? d.locais.rms[0].slug);
  }

  const un = d.nomes[partes[0][0]]?.unidade;
  const periodo = ini === fim ? ini : `${ini}–${fim}`;
  return (
    <>
      <Explicacao
        como="a lista mostra só os 12 indicadores principais, agrupados por tema. Dentro da página do indicador, os recortes viram botões e o gráfico troca sem sair da página."
        pros="lista curta; o recorte aparece junto do total, no mesmo gráfico; fácil comparar grupos."
        contras="quem procura um recorte específico precisa entrar no indicador; é a mudança mais trabalhosa."
      />
      <div className={styles.filtros}>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>Indicador (lista suspensa nova)</span>
          <select className={styles.select} value={ind.id} onChange={e => { setInd(TODOS.find(i => i.id === e.target.value)!); setRecorte(0); }}>
            {TEMAS.map(t => (
              <optgroup key={t.id} label={t.nome}>
                {t.indicadores.map(i => <option key={i.id} value={i.id}>{i.nome}{temDado(i) ? '' : ' (só capitais)'}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <div className={styles.grupo}>
          <span className={styles.rotulo}>Nível</span>
          <div className={styles.botoes} role="radiogroup" aria-label="Nível" style={{ marginBottom: 0 }}>
            {(['capitais', 'rms'] as Nivel[]).map(n => (
              <button key={n} type="button" role="radio" aria-checked={nivel === n} className={styles.opcao} onClick={() => mudarNivel(n)}>
                {n === 'capitais' ? 'Capitais' : 'Regiões metropolitanas'}
              </button>
            ))}
          </div>
        </div>
        <label className={styles.grupo}>
          <span className={styles.rotulo}>{nivel === 'capitais' ? 'Capital' : 'Região metropolitana'}</span>
          <select className={styles.select} value={local} onChange={e => setLocal(e.target.value)}>
            {d.locais[nivel].map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
          </select>
        </label>
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
              <button key={r} type="button" role="radio" aria-checked={recorte === i} className={styles.opcao} onClick={() => setRecorte(i)}>{r}</button>
            ))}
          </div>
        )}
        <p className="nota">{nomeLocal}{un ? ` · ${un}` : ''}{anos.length ? ` · ${periodo}` : ''}</p>
        {anos.length
          ? <Grafico config={config} altura={300} descricao={`${ind.nome} em ${nomeLocal}`} imagem={{ titulo: `${ind.nome} — ${nomeLocal}`, subtitulo: periodo }} />
          : <p className={styles.vazio}>Sem dados deste recorte para {nomeLocal}{nivel === 'rms' ? ' (a base tem este indicador só para as capitais)' : ''}.</p>}
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
