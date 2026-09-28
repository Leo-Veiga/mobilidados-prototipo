import Link from 'next/link';

export default function NaoEncontrada() {
  return (
    <div className="container centro" style={{ padding: '100px 20px' }}>
      <h1>Página não encontrada</h1>
      <p>O endereço pode ter mudado ou a página ainda não foi publicada.</p>
      <p><Link href="/" style={{ color: 'var(--verde-300)' }}>Voltar para a página inicial</Link></p>
    </div>
  );
}
