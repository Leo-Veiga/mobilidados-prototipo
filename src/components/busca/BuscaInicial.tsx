'use client';

import { useState } from 'react';
import Abas from '@/components/Abas';
import BuscaSelecao, { type OpcaoBusca } from '@/components/BuscaSelecao';

/** Caixa de busca da página inicial: por localização ou por indicador */
export default function BuscaInicial({ locais, indicadores }: { locais: OpcaoBusca[]; indicadores: OpcaoBusca[] }) {
  const [aba, setAba] = useState<'local' | 'indicador'>('local');
  return (
    <Abas
      rotulo="Tipo de busca" ativa={aba} aoMudar={setAba}
      abas={[{ id: 'local', titulo: 'Localização' }, { id: 'indicador', titulo: 'Indicadores' }]}
    >
      {aba === 'local'
        ? <BuscaSelecao
            key="local" icone="local" rotulo="Escolha uma localização" placeholder="Selecione uma localização"
            opcoes={locais} verTodos={{ rotulo: 'Exibir todas as localizações', href: '/capitais/' }}
          />
        : <BuscaSelecao
            key="indicador" icone="grafico" rotulo="Escolha um indicador" placeholder="Selecione um indicador"
            opcoes={indicadores} verTodos={{ rotulo: 'Exibir todos os indicadores', href: '/indicadores/' }}
          />}
    </Abas>
  );
}
