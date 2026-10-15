"""
Leva para a planilha do site os indicadores recalculados no repositório mobilidados-indicadores.

Uso:
    python scripts/importar_indicadores.py <pasta saida/ do mobilidados-indicadores> [planilha.xlsx]

Regras (configuradas abaixo):
    COMPARAVEIS -> substitui os anos que o cálculo novo cobre; anos anteriores ficam como estão
    METODO_NOVO -> apaga a coluna inteira e grava só a série nova, a partir de ANO_MINIMO
    NOVOS       -> como METODO_NOVO, criando a coluna se a aba ainda não tiver
    REMOVER     -> colunas apagadas das abas de indicadores e de informações gerais
    FICHA       -> ficha_mobilidade.csv (se houver na pasta) substitui inteira a aba FICHA_ABA
Acrescenta as linhas de anos novos de cada capital e RM e diz o que mudou. Locais que o
cálculo novo não cobre (ex.: RM de Porto Alegre) ficam intactos. Fórmulas viram valores (o
conversor do site lê só valores, e o openpyxl não recalcula fórmulas ao salvar).
"""
import csv
import glob
import os
import sys

import openpyxl

COMPARAVEIS = {
    'TX_MORT_TOT', 'TX_MORT_PED', 'TX_MORT_CICL', 'TX_MORT_AUTO', 'TX_MORT_MOTO', 'PERC_MORTE_NEGROS',
    'TX_INTERN_TOT', 'TX_INTERN_PED', 'TX_INTERN_CIC', 'TX_INTERN_AUTO', 'TX_INTERN_MOTO',
    'TX_MOTO',
}
RENDA_RESP = ['RESP_ATE_1/2', 'RESP_1/2_1', 'RESP_1_3', 'RESP_ACIMA_3']
METODO_NOVO = {
    'PNB', 'PNB_MULHERES_NEGRAS', 'PNT', 'PNT_MULHERES_NEGRAS',  # só Censo 2022
    'TMA_INFRA_CICLO', 'TARIFAxSM',
    'PERC_CALÇADAS', 'PERC_RAMPAS', 'TEMPO_MED', 'PERC_ACIMA_1H',  # só Censo 2022
}
# Indicadores e dados de ficha que podem ganhar coluna nova
NOVOS = {
    'POP',
    *(f'{i}_{r}' for i in ('PNB', 'PNT') for r in RENDA_RESP),
    'AREA_KM2', 'AREA_URB_KM2', 'DENS', 'DENS_URB', 'PERC_NEGROS', 'PERC_BRANCOS', 'PERC_MULHERES',
    'PERC_HOMENS', 'RENDA_MED_PC', 'PERC_ATE_1SM_PC',
    *(f'TMA_ESTACOES_{m}' for m in ('BARCA', 'BRT', 'METRO', 'MONOTRILHO', 'TREM', 'VLT')),
}
# Primeiro ano publicado (PNB e PNT só com o Censo 2022)
ANO_MINIMO = {c: 2022 for c in NOVOS | METODO_NOVO if c.startswith(('PNB', 'PNT'))}
REMOVER = {
    'TARIFAX RENDA_DOM_NEGRA', 'INFRA_CICLO_ESTB_SAÚDE',
    *(f'{i}_{r}' for i in ('PNB', 'PNT') for r in ('ATE_1/2', '1/2_1', '1_3', 'ACIMA_3', 'MULHERES_1SM')),
    'PNB_MULHERES_ATE_2SM',
    # Informações gerais que agora vêm do Censo 2022 (séries acima) ou eram do Censo 2010
    'Área total (km²)', 'Área urbana (km²)', 'Pop_2016', 'Densidade (hab./km²)', 'Densidade urbana (hab./km²)',
    'Renda média', 'Perc_DR_<1SM', 'Perc_Negros', 'Perc_Mulheres', 'Perc_Brancos', 'Perc_Homens',
    *(f'tma_estacao_{m}' for m in ('barca', 'brt', 'metro', 'monotrilho', 'trem', 'vlt')),
    # Campos de mobilidade da ficha: agora na aba FICHA_ABA, com ano e fonte
    'lai_contrato', 'lai_contrato_inicio', 'lai_contrato_prazo', 'lai_contrato_fonte', 'lai_gps', 'lai_gps_frota',
    'lai_gps_fonte', 'lai_gtfs', 'lai_gtfs_fonte', 'planmob_status', 'planmob_ano_aprovacao', 'planmob_fonte',
}
ARQUIVOS = ['populacao', 'mortalidade', 'internacoes', 'motorizacao', 'pnb', 'pnt', 'tarifas', 'tma_ciclo',
            'tempo_deslocamento', 'censo2022', 'tma_modos']
# aba -> coluna com o código do local (código IBGE da capital ou CD_RM)
ABAS = {'Indicadores_capitais': 'CD_MUN', 'Indicadores_RMs': 'CD_RM'}
ABAS_INFO = ['Info_gerais_capitais', 'Info_gerais_RMs']
# Ficha da capital (aba Mobilidade): campos em texto, um por linha, com fonte e camada
FICHA = 'ficha_mobilidade'
FICHA_ABA = 'Ficha_mobilidade_capitais'
FICHA_COLUNAS = ['CD_MUN', 'CAPITAL', 'ANO', 'CAMPO', 'VALOR', 'FONTE', 'CAMADA']
COLUNAS_ID = {'CD_UF', 'UF', 'CD_MUN', 'COD_MUN6', 'CAPITAIS', 'CD_RM', 'RM', 'CD_MUN_6'}


def ler_saida(pasta):
    """{indicador: {(local, ano): valor}} dos CSVs longos local;ano;indicador;valor."""
    dados = {}
    usados = COMPARAVEIS | METODO_NOVO | NOVOS
    for nome in ARQUIVOS:
        with open(os.path.join(pasta, nome + '.csv'), encoding='utf-8-sig', newline='') as f:
            for r in csv.DictReader(f, delimiter=';'):
                ind = r['indicador']
                if ind not in usados or r['valor'] in ('', 'NA') or int(r['ano']) < ANO_MINIMO.get(ind, 0):
                    continue
                v = float(r['valor'])
                dados.setdefault(ind, {})[(int(r['local']), int(r['ano']))] = int(v) if v.is_integer() else v
    return dados


def congelar_formulas(wb, caminho):
    valores = openpyxl.load_workbook(caminho, data_only=True)
    for ws in wb:
        for linha in ws.iter_rows():
            for c in linha:
                if isinstance(c.value, str) and c.value.startswith('='):
                    c.value = valores[ws.title][c.coordinate].value


def cabecalho(ws):
    return {str(c.value).strip(): c.column for c in ws[1] if c.value is not None}


def remover_colunas(ws):
    cab = cabecalho(ws)
    removidas = sorted((n for n in REMOVER if n in cab), key=lambda n: -cab[n])
    for n in removidas:  # da direita para a esquerda, para os índices não mudarem
        ws.delete_cols(cab[n])
    return sorted(removidas)


def atualizar_aba(ws, col_local, dados):
    cab = cabecalho(ws)
    c_local, c_ano = cab[col_local], cab['ANO']
    linhas, ultima, modelo = {}, 1, {}
    for r in range(2, ws.max_row + 1):
        local, ano = ws.cell(r, c_local).value, ws.cell(r, c_ano).value
        if local is None or ano is None:
            continue
        linhas[(int(local), int(ano))] = r
        ultima = r
        modelo[int(local)] = r  # última linha do local: modelo para as colunas de identificação
    locais = set(modelo) & {l for serie in dados.values() for l, _ in serie}
    # Colunas novas: só para indicadores com dados nos locais desta aba
    for ind in sorted(NOVOS - set(cab)):
        if any(l in locais for l, _ in dados.get(ind, {})):
            col = ws.max_column + 1
            ws.cell(1, col).value = ind
            cab[ind] = col
    resumo = {}
    substituir = METODO_NOVO | NOVOS
    for ind in sorted((set(dados) | substituir) & set(cab)):
        col = cab[ind]
        serie = {k: v for k, v in dados.get(ind, {}).items() if k[0] in locais}
        if not serie and ind not in substituir:
            continue
        inicio = min((a for _, a in serie), default=0)
        apagadas = 0
        for (local, ano), r in linhas.items():
            if local in locais and (ind in substituir or ano >= inicio):
                if isinstance(ws.cell(r, col).value, (int, float)) and (local, ano) not in serie:
                    apagadas += 1
                ws.cell(r, col).value = None
        for (local, ano), v in sorted(serie.items()):
            if (local, ano) not in linhas:
                ultima += 1
                for nome, c in cab.items():
                    if nome in COLUNAS_ID:
                        ws.cell(ultima, c).value = ws.cell(modelo[local], c).value
                ws.cell(ultima, c_ano).value = ano
                linhas[(local, ano)] = ultima
            ws.cell(linhas[(local, ano)], col).value = v
        anos = sorted({a for _, a in serie}) or ['-']
        resumo[ind] = (anos[0], anos[-1], len(serie), apagadas)
    return resumo


def importar_ficha(wb, arquivo):
    """Regrava a aba da ficha a partir do CSV longo (o campo, <CAMPO>_FONTE e <CAMPO>_CAMADA)."""
    cab = cabecalho(wb['Info_gerais_capitais'])
    nomes = {int(r[cab['CD_MUN'] - 1]): r[cab['CAPITAL'] - 1]
             for r in wb['Info_gerais_capitais'].iter_rows(min_row=2, values_only=True) if r[cab['CD_MUN'] - 1]}
    campos = {}
    with open(arquivo, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f, delimiter=';'):
            ind, extra = r['indicador'], ''
            for sufixo in ('_FONTE', '_CAMADA'):
                if ind.endswith(sufixo):
                    ind, extra = ind[:-len(sufixo)], sufixo[1:]
            campos.setdefault((int(r['local']), int(r['ano']), ind), {})[extra or 'VALOR'] = r['valor']
    if FICHA_ABA in wb.sheetnames:
        del wb[FICHA_ABA]
    ws = wb.create_sheet(FICHA_ABA)
    ws.append(FICHA_COLUNAS)
    for (local, ano, campo), v in sorted(campos.items()):
        ws.append([local, nomes.get(local), ano, campo, v.get('VALOR'), v.get('FONTE') or None, v.get('CAMADA')])
    print(f'{FICHA_ABA}: {len(campos)} valores de {len({k[0] for k in campos})} capitais, '
          f'{min(k[1] for k in campos)}-{max(k[1] for k in campos)}')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pasta = sys.argv[1]
    caminho = sys.argv[2] if len(sys.argv) > 2 else glob.glob(
        os.path.join(os.path.dirname(__file__), '..', 'dados', '*.xlsx'))[0]
    dados = ler_saida(pasta)
    wb = openpyxl.load_workbook(caminho)
    congelar_formulas(wb, caminho)
    for aba in ABAS_INFO:
        removidas = remover_colunas(wb[aba])
        if removidas:
            print(f'{aba}: colunas removidas: ' + ', '.join(removidas))
    for aba, col_local in ABAS.items():
        print(aba)
        removidas = remover_colunas(wb[aba])
        if removidas:
            print('  colunas removidas: ' + ', '.join(removidas))
        for ind, (a0, a1, n, apagadas) in sorted(atualizar_aba(wb[aba], col_local, dados).items()):
            extra = f'; {apagadas} valor(es) antigo(s) apagado(s)' if apagadas else ''
            print(f'  {ind:24} {a0}-{a1}  {n} valores{extra}')
    ficha = os.path.join(pasta, FICHA + '.csv')
    if os.path.exists(ficha):
        importar_ficha(wb, ficha)
    wb.save(caminho)


if __name__ == '__main__':
    main()
