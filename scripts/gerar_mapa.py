"""Converte o contorno dos estados (dados/mapa/estados.geojson, malha do IBGE simplificada por
scripts/mapa_estados.R) em caminhos SVG para o mapa interativo da página de localização.

Saída: src/data/mapa-brasil.json. A projeção é simples (equirretangular com correção do cosseno da
latitude média do país); a mesma conta é usada no site para posicionar capitais e RMs.
"""
import json
import math
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRADA = os.path.join(RAIZ, 'dados', 'mapa', 'estados.geojson')
SAIDA = os.path.join(RAIZ, 'src', 'data', 'mapa-brasil.json')
LARGURA = 1000
COS = math.cos(math.radians(14))  # latitude média do Brasil


def main():
    g = json.load(open(ENTRADA, encoding='utf-8'))
    pontos = [p for f in g['features'] for pol in (f['geometry']['coordinates'] if f['geometry']['type'] == 'MultiPolygon' else [f['geometry']['coordinates']]) for anel in pol for p in anel]
    lon_min, lon_max = min(p[0] for p in pontos), max(p[0] for p in pontos)
    lat_min, lat_max = min(p[1] for p in pontos), max(p[1] for p in pontos)
    escala = LARGURA / ((lon_max - lon_min) * COS)
    altura = round((lat_max - lat_min) * escala)
    xy = lambda lon, lat: (round((lon - lon_min) * COS * escala, 1), round((lat_max - lat) * escala, 1))

    estados = []
    for f in g['features']:
        geo = f['geometry']
        poligonos = geo['coordinates'] if geo['type'] == 'MultiPolygon' else [geo['coordinates']]
        partes = []
        for pol in poligonos:
            for anel in pol:
                pts = [xy(*p[:2]) for p in anel]
                partes.append('M' + 'L'.join(f'{x:g},{y:g}' for x, y in pts) + 'Z')
        p = f['properties']
        estados.append({'uf': p['abbrev_state'], 'nome': p['name_state'], 'regiao': p['name_region'], 'd': ''.join(partes)})

    dados = {'largura': LARGURA, 'altura': altura, 'lonMin': lon_min, 'latMax': lat_max, 'cos': COS, 'escala': escala,
             'estados': sorted(estados, key=lambda e: e['uf'])}
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dados, f, ensure_ascii=False, separators=(',', ':'))
    print(f'OK: mapa -> {len(estados)} estados, {os.path.getsize(SAIDA) // 1024} KB')


if __name__ == '__main__':
    main()
