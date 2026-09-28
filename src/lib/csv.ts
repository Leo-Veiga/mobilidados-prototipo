/** Gera e baixa um CSV no navegador (separador ';' e BOM, para abrir direto no Excel em português). */
export function baixarCSV(nome: string, linhas: (string | number | null | undefined)[][]) {
  const csv = '﻿' + linhas.map(l => l.map(c => {
    const s = c == null ? '' : typeof c === 'number' ? String(c).replace('.', ',') : c;
    return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = nome + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
