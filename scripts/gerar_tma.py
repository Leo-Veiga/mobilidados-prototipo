"""Converte o Mapa de TMA (Transporte de Média e Alta Capacidade) em dados para a aba TMA do site.

Entradas (dados/tma/):
    corredores.csv    trechos de corredor: Modo, Cidade_n, Situação, Ano, TMA, Extensão (km)
    estacoes.csv      estações: Modo, Cidade_n, Situação, Ano, TMA
    municipios.csv    municípios por onde passa a rede TMA operacional (cruzamento com a malha
                      municipal do IBGE, feito em R; ver dados/tma/LEIAME.md)
Saída:
    src/data/tma.json

Os CSVs de entrada são extraídos das planilhas do Mapa de TMA com:
    python scripts/gerar_tma.py --importar "<pasta com Corredores_AAAA.xlsx e Estacoes_AAAA.xlsx>"
(só as colunas acima vão para o repositório).

Regras:
- Rede operacional = Situação "Operacional" (sem distinguir espaços/maiúsculas) e TMA = "Sim".
- Projeção = Situação "Planejado" ou "Em construção", TMA diferente de "Não", com ano previsto
  posterior ao ano de referência do mapa (o último ano com inauguração registrada).
- A série é reconstruída pelo ano de inauguração de cada trecho. Trechos sem ano válido
  entram no total de hoje, mas não na série; a quantidade aparece como aviso na página.
"""
import csv
import datetime
import glob
import json
import os
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'dados', 'tma')
SAIDA = os.path.join(RAIZ, 'src', 'data', 'tma.json')
MODOS = ['BRT', 'Metrô', 'Trem', 'VLT', 'Monotrilho', 'Barca']
COLUNAS_CORREDOR = ['Modo', 'Cidade_n', 'Situação', 'Ano', 'TMA', 'Extensão']
COLUNAS_ESTACAO = ['Modo', 'Cidade_n', 'Situação', 'Ano', 'TMA']
ANO_MIN, ANO_MAX_PROJ = 1850, 2040
INICIO_GRAFICO = 1970


def norm(s):
    s = unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode()
    return ' '.join(s.lower().split())


def ano(v):
    try:
        a = int(float(str(v).replace(',', '.')))
    except ValueError:
        return None
    return a if ANO_MIN <= a <= ANO_MAX_PROJ else None


def km(v):
    try:
        return float(str(v).replace(',', '.'))
    except ValueError:
        return None


def importar(pasta):
    """Extrai das planilhas do Mapa de TMA só as colunas usadas pelo site."""
    import openpyxl
    for padrao, saida, cols in [('Corredores_*.xlsx', 'corredores.csv', COLUNAS_CORREDOR),
                                ('Estacoes_*.xlsx', 'estacoes.csv', COLUNAS_ESTACAO)]:
        arq = sorted(glob.glob(os.path.join(pasta, padrao)))[-1]
        ws = openpyxl.load_workbook(arq, read_only=True, data_only=True).worksheets[0]
        linhas = list(ws.iter_rows(values_only=True))
        cab = [str(c).strip() if c is not None else '' for c in linhas[0]]
        idx = [cab.index(c) for c in cols]
        with open(os.path.join(PASTA, saida), 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f, delimiter=';')
            w.writerow(cols)
            for r in linhas[1:]:
                if any(r[i] not in (None, '') for i in idx):
                    w.writerow(['' if r[i] is None else r[i] for i in idx])
        print(f'{os.path.basename(arq)} -> dados/tma/{saida}')


def ler(nome):
    with open(os.path.join(PASTA, nome), encoding='utf-8-sig') as f:
        return list(csv.DictReader(f, delimiter=';'))


def main():
    corredores, estacoes, municipios = ler('corredores.csv'), ler('estacoes.csv'), ler('municipios.csv')
    operacional = lambda r: norm(r['Situação']) == 'operacional' and norm(r['TMA']) == 'sim'
    previsto = lambda r: norm(r['Situação']) in ('planejado', 'em construcao') and norm(r['TMA']) != 'nao'

    # Ano de referência do mapa: o último ano com inauguração registrada (não o ano corrente)
    hoje = min(datetime.date.today().year,
               max(a for r in corredores if operacional(r) and (a := ano(r['Ano'])) is not None))
    anos = list(range(INICIO_GRAFICO, hoje + 1))
    anos_proj = list(range(hoje + 1, 2031))
    sistemas = sorted({r['Cidade_n'].strip() for r in corredores + estacoes if operacional(r)})
    vazio = lambda: {m: {} for m in MODOS}
    series = {s: {'km': vazio(), 'estacoes': vazio(), 'kmProj': {}, 'estacoesProj': {}} for s in ['Brasil'] + sistemas}
    avisos = {'trechosSemAno': 0, 'kmSemAno': 0.0, 'trechosSemExtensao': 0, 'estacoesSemAno': 0, 'previstosSemAno': 0}  # previstos: só trechos de corredor
    resumo_modo = {m: 0.0 for m in MODOS}
    base = {s: {'km': 0.0, 'estacoes': 0} for s in ['Brasil'] + sistemas}

    def somar(dic, chave, valor):
        dic[chave] = round(dic.get(chave, 0) + valor, 3)

    for tipo, linhas in [('km', corredores), ('estacoes', estacoes)]:
        for r in linhas:
            modo, sis = r['Modo'].strip(), r['Cidade_n'].strip()
            valor = 1 if tipo == 'estacoes' else km(r['Extensão'])
            if valor is None:
                avisos['trechosSemExtensao'] += 1
                continue
            a = ano(r['Ano'])
            if operacional(r):
                if tipo == 'km':
                    resumo_modo[modo] += valor
                for s in ('Brasil', sis):
                    base[s][tipo] += valor
                    if a is None:
                        continue
                    # Antes do início do gráfico, tudo entra no primeiro ano (a série é acumulada)
                    somar(series[s][tipo][modo], str(max(a, INICIO_GRAFICO)), valor)
                if a is None:
                    avisos['trechosSemAno' if tipo == 'km' else 'estacoesSemAno'] += 1
                    if tipo == 'km':
                        avisos['kmSemAno'] += valor
            elif previsto(r):
                if a is None or a <= hoje:
                    if tipo == 'km':
                        avisos['previstosSemAno'] += 1
                    continue
                for s in ('Brasil', sis):
                    if s in series:
                        somar(series[s][tipo + 'Proj'], str(min(a, 2030)), valor)

    por_sistema = {}
    for m in municipios:
        for s in m['Cidade_n'].split(', '):
            por_sistema.setdefault(s.strip(), set()).add(m['code_muni'])
    total_km = sum(resumo_modo.values())
    km_ha_10 = sum(v for m in MODOS for a, v in series['Brasil']['km'][m].items() if int(a) <= hoje - 10)

    dados = {
        'geradoEm': datetime.date.today().isoformat(),
        'modos': MODOS,
        'anos': anos,
        'anosProjecao': anos_proj,
        'inicioGrafico': INICIO_GRAFICO,
        'anoReferencia': hoje,
        'resumo': {
            'km': round(total_km),
            'estacoes': base['Brasil']['estacoes'],
            'municipios': len(municipios),
            'sistemas': len(sistemas),
            'porModo': {m: round(v / total_km, 3) for m, v in resumo_modo.items() if v},
            'kmPorModo': {m: round(v) for m, v in resumo_modo.items() if v},
            'kmUltimos10Anos': round(total_km - km_ha_10),
        },
        'sistemas': [{'nome': s, 'km': round(base[s]['km'], 1), 'estacoes': base[s]['estacoes'],
                      'municipios': len(por_sistema.get(s, ()))} for s in sistemas],
        'series': series,
        'avisos': {k: round(v) for k, v in avisos.items()},
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dados, f, ensure_ascii=False, indent=1)
    print(f"OK: TMA -> {dados['resumo']['km']} km, {dados['resumo']['estacoes']} estações, "
          f"{len(sistemas)} sistemas, {len(municipios)} municípios; avisos: {dados['avisos']}")


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--importar':
        importar(sys.argv[2])
    else:
        main()
