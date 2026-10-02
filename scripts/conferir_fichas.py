"""
Confere as fichas em PDF (out/capitais/<slug>/ficha.pdf) contra a base de dados.

Para cada capital, lê o texto do PDF e verifica se cada indicador aparece com o
valor mais recente, o ano e a posição entre as capitais calculados direto do JSON.
Serve de garantia de que a ficha não traz número inventado ou trocado.

Uso: python scripts/conferir_fichas.py   (depois do build)
"""
import json
import os
import re
import sys
from decimal import ROUND_HALF_UP, Decimal
from statistics import median

from pypdf import PdfReader

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
C = json.load(open(os.path.join(RAIZ, 'src/data/indicadores-capitais.json'), encoding='utf-8'))
caps = json.load(open(os.path.join(RAIZ, 'src/data/capitais.json'), encoding='utf-8'))


def br(v):
    """Mesmo formato do PDF: até 1 casa decimal (5 arredonda para cima), vírgula, ponto de milhar."""
    d = Decimal(repr(v)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
    s = f'{d:,.1f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return s[:-2] if s.endswith(',0') else s


erros, conferidos = [], 0
for c in caps:
    pdf = os.path.join(RAIZ, 'out', 'capitais', c['slug'], 'ficha.pdf')
    texto = re.sub(r'\s+', ' ', ' '.join(p.extract_text() or '' for p in PdfReader(pdf).pages))
    for cod, series in C.items():
        if cod == 'POP' or c['slug'] not in series:
            continue
        ano = max(series[c['slug']], key=int)
        v = series[c['slug']][ano]
        doano = [s[ano] for s in series.values() if ano in s]
        pos = 1 + sum(x > v for x in doano)
        esperado = f'{br(v)} {ano} {br(median(doano))} {pos}ª de {len(doano)}'
        conferidos += 1
        if esperado not in texto:
            erros.append(f"{c['nome']}: {cod} — esperado '{esperado}'")

print(f'{conferidos} valores conferidos em {len(caps)} fichas; {len(erros)} divergência(s).')
for e in erros[:20]:
    print(' -', e)
sys.exit(1 if erros else 0)
