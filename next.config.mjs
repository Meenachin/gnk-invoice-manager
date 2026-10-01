/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit'],

  outputFileTracingIncludes: {
    '/*': [
      './node_modules/pdfkit/js/standard-fonts/**/*',
    ],
  },
};

export default nextConfig;
