import type { NextConfig } from 'next';

// No GitHub Pages sem domínio próprio o site fica em /<nome-do-repositório>.
// O workflow de publicação define BASE_PATH; localmente fica vazio.
// Com domínio próprio (ex.: mobilidados.org.br), basta remover BASE_PATH do workflow.
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export', // gera um site 100% estático na pasta out/
  trailingSlash: true, // /capitais/recife/ -> capitais/recife/index.html
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
