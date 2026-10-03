"""Monta os dados da aba ENMU (Estudo Nacional de Mobilidade Urbana, BNDES e Ministério das Cidades).

Entradas (dados/enmu/):
    projetos.csv       banco de projetos do Portal Mobilidade Brasil (só as colunas usadas)
    prazos_rm.csv      prazo estimado de implantação por RM (Boletim Informativo nº 6, fev/2026, slide 6)
    monitoramento.csv  acompanhamento feito pela MobiliDADOS: um registro por projeto e ano
                       (id_projeto; ano; situacao; km_entregues; fonte; observacao)
Saída:
    src/data/enmu.json

Atualizar o banco de projetos a partir do portal:
    python scripts/gerar_enmu.py --importar

Projeção (premissas do Boletim nº 6, apêndice 3):
- 2026–2027 estruturação, sem investimento; 2028 = 0,12% do PIB; 2029 = 0,23%; de 2030 em diante 0,35%
  ao ano até a RM concluir seus projetos no prazo estimado (contado a partir de 2026).
- Hipótese da MobiliDADOS: os km de cada RM avançam na mesma proporção do investimento.
- Projetos com tecnologia alternativa (ex.: BRT ou VLT no mesmo eixo): o cenário "menor custo" usa a opção
  mais barata e o prazo mínimo da RM; o cenário "maior custo", a mais cara e o prazo máximo.
"""
import base64
import csv
import datetime
import json
import os
import sys
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'dados', 'enmu')
SAIDA = os.path.join(RAIZ, 'src', 'data', 'enmu.json')
API = 'https://mobilidadebrasil.bndes.gov.br/WSListaProjetos.asmx/BuscarDadosTabela'
INICIO, FIM = 2026, 2070
PESO = {2026: 0, 2027: 0, 2028: 0.12 / 0.35, 2029: 0.23 / 0.35}  # demais anos: 1
COLUNAS = ['id', 'id_alternativa', 'rm', 'projeto', 'tecnologia', 'extensao_km', 'estacoes', 'estagio',
           'nivel_atualizacao', 'investimento_mi', 'embarques_dia', 'abrangencia', 'obitos_evitados_ano']
SITUACOES = ['Em estruturação', 'Licitado ou contratado', 'Em obras', 'Inaugurado em parte', 'Inaugurado',
             'Paralisado', 'Cancelado']


def num(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def importar():
    """Baixa o banco de projetos do Portal Mobilidade Brasil e guarda só as colunas usadas."""
    filtro = json.dumps({'CdPrjNome': None, 'CdPrjId': [], 'DfUsuId': '1', 'GfRMeCodigo': '', 'FiltrarConflitos': False})
    corpo = json.dumps({'filtros': base64.b64encode(filtro.encode()).decode()}).encode()
    req = urllib.request.Request(API, data=corpo, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        lista = json.loads(json.load(r)['d'])['ListaProjetos']
    with open(os.path.join(PASTA, 'projetos.csv'), 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(COLUNAS)
        for p in sorted(lista, key=lambda p: (p['Identificacao']['RegiaoMetropolitana'], p['IdProjeto'])):
            i, s, fin = p['Identificacao'], p['SolucaoTecnologica'], p['Financeira']
            w.writerow([p['IdProjeto'], p['IdProjetoAlt'] or '', i['RegiaoMetropolitana'], i['DesignacaoProjeto'],
                        s['SolucaoTecnologicaConsideradaSimulacao'], s['Extensao'] or '', s['QuantidadeEstacoes'] or '',
                        i['EstagioProjeto'] or '', i['NivelAtualizacao'] or '',
                        fin['ValorNominalTotalInvestimentoNoCicloInicial'] or '', p['Tecnica']['EmbarquesDia'] or '',
                        i['Abrangencia'] or '', p['Socioambiental']['ImpactoEmSinistrosComObitosAnual'] or ''])
    print(f'{len(lista)} projetos -> dados/enmu/projetos.csv')


def ler(nome):
    with open(os.path.join(PASTA, nome), encoding='utf-8-sig') as f:
        return list(csv.DictReader(f, delimiter=';'))


def fracao_acumulada(prazo):
    """Parcela do investimento da RM concluída ao fim de cada ano (premissas do Boletim nº 6)."""
    fim = INICIO + prazo - 1
    pesos = {a: PESO.get(a, 1) for a in range(INICIO, fim + 1)}
    total, soma, frac = sum(pesos.values()), 0, []
    for a in range(INICIO, FIM + 1):
        soma += pesos.get(a, 0)
        frac.append(soma / total)
    return frac


def main():
    projetos, prazos, monit = ler('projetos.csv'), {p['rm']: p for p in ler('prazos_rm.csv')}, ler('monitoramento.csv')
    erros = []

    # Agrupa as alternativas tecnológicas do mesmo eixo
    grupos = {}
    for p in projetos:
        p['km'] = num(p['extensao_km']) or 0
        p['inv'] = num(p['investimento_mi']) or 0
        grupos.setdefault(p['id_alternativa'] or p['id'], []).append(p)
    escolha = {'min': set(), 'max': set()}
    for g in grupos.values():
        escolha['min'].add(min(g, key=lambda p: p['inv'])['id'])
        escolha['max'].add(max(g, key=lambda p: p['inv'])['id'])

    # Monitoramento: a última situação de cada projeto e os km entregues por ano
    ids = {p['id'] for p in projetos}
    rm_do = {p['id']: p['rm'] for p in projetos}
    ultima, entregue = {}, {}
    for i, m in enumerate(monit, start=2):
        ano = int(num(m['ano']) or 0)
        if m['id_projeto'] not in ids:
            erros.append(f'monitoramento.csv linha {i}: projeto {m["id_projeto"]} não existe em projetos.csv')
            continue
        if m['situacao'] not in SITUACOES:
            erros.append(f'monitoramento.csv linha {i}: situação "{m["situacao"]}" (use: {", ".join(SITUACOES)})')
        if not ultima.get(m['id_projeto']) or ano >= ultima[m['id_projeto']]['ano']:
            ultima[m['id_projeto']] = {'ano': ano, 'situacao': m['situacao'], 'fonte': m['fonte']}
        km = num(m['km_entregues']) or 0
        for chave in ('Brasil', rm_do[m['id_projeto']]):
            entregue.setdefault(chave, {})
            entregue[chave][str(ano)] = round(entregue[chave].get(str(ano), 0) + km, 2)

    rms = sorted({p['rm'] for p in projetos})
    faltando = [r for r in rms if r not in prazos]
    if faltando:
        erros.append('RMs sem prazo em prazos_rm.csv: ' + ', '.join(faltando))
    if erros:
        print('ERRO nos dados do ENMU:')
        for e in erros:
            print(' -', e)
        sys.exit(1)

    anos = list(range(INICIO, FIM + 1))
    projecao = {'Brasil': {'min': [0.0] * len(anos), 'max': [0.0] * len(anos)}}
    tabela = []
    for rm in rms:
        doRm = [p for p in projetos if p['rm'] == rm]
        pr = prazos[rm]
        linha = {'nome': rm, 'projetos': len({p['id_alternativa'] or p['id'] for p in doRm})}
        projecao[rm] = {}
        for cen, coluna in (('min', 'prazo_min_anos'), ('max', 'prazo_max_anos')):
            esc = [p for p in doRm if p['id'] in escolha[cen]]
            km = sum(p['km'] for p in esc)
            prazo = int(pr[coluna])
            serie = [round(km * f, 2) for f in fracao_acumulada(prazo)]
            projecao[rm][cen] = serie
            projecao['Brasil'][cen] = [round(a + b, 2) for a, b in zip(projecao['Brasil'][cen], serie)]
            linha['km' + cen.capitalize()] = round(km, 1)
            linha['inv' + cen.capitalize()] = round(sum(p['inv'] for p in esc))
            linha['prazo' + cen.capitalize()] = prazo
            linha['conclusao' + cen.capitalize()] = INICIO + prazo - 1
        linha['kmEntregue'] = round(sum(entregue.get(rm, {}).values()), 1)
        tabela.append(linha)

    lista = [{
        'id': p['id'], 'rm': p['rm'], 'nome': p['projeto'], 'tecnologia': p['tecnologia'], 'km': p['km'],
        'estagio': p['estagio'], 'investimento': round(p['inv']),
        'alternativa': len(grupos[p['id_alternativa'] or p['id']]) > 1,
        'situacao': ultima.get(p['id'], {}).get('situacao'), 'anoSituacao': ultima.get(p['id'], {}).get('ano'),
    } for p in projetos]

    dados = {
        'geradoEm': datetime.date.today().isoformat(),
        'anos': anos,
        'resumo': {
            'projetos': len(grupos), 'registrosPortal': len(projetos), 'rms': len(rms),
            'kmMin': round(sum(l['kmMin'] for l in tabela)), 'kmMax': round(sum(l['kmMax'] for l in tabela)),
            'invMin': round(sum(l['invMin'] for l in tabela)), 'invMax': round(sum(l['invMax'] for l in tabela)),
            'kmEntregue': round(sum(entregue.get('Brasil', {}).values()), 1),
            'projetosComSituacao': len(ultima),
        },
        'rms': tabela,
        'projecao': projecao,
        'entregue': entregue,
        'projetos': lista,
        'situacoes': SITUACOES,
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dados, f, ensure_ascii=False, indent=1)
    r = dados['resumo']
    print(f"OK: ENMU -> {r['projetos']} projetos em {r['rms']} RMs, {r['kmMin']}–{r['kmMax']} km; "
          f"{r['projetosComSituacao']} com acompanhamento")


if __name__ == '__main__':
    importar() if '--importar' in sys.argv else main()
