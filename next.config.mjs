/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Evita renders dobles en desarrollo
  swcMinify: true, // Usa el minificador SWC para optimizar el JS
  experimental: {
    optimizeCss: true, // Activa la optimización de CSS para reducir el tiempo de carga
  },
};

export default nextConfig;
