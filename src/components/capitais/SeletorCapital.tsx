'use client';

import { useRouter } from 'next/navigation';
import type { Lugar } from '@/lib/tipos';

/** Lista suspensa que leva à página de outra capital */
export default function SeletorCapital({ capitais, atual }: { capitais: (Lugar & { uf: string })[]; atual: string }) {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 420, margin: '0 auto 36px' }}>
      <label className="rotulo-campo" htmlFor="capital">Capital</label>
      <select
        id="capital" className="campo" value={atual}
        onChange={e => router.push(`/capitais/${e.target.value}/#sobre`)}
      >
        {capitais.map(c => <option key={c.slug} value={c.slug}>{c.nome} ({c.uf})</option>)}
      </select>
    </div>
  );
}
