import type { AstroIntegration } from 'astro';

export default function envLogger(): AstroIntegration {
  return {
    name: 'env-logger',
    hooks: {
      'astro:config:setup': () => {
        console.log('🌍 Environment Variables at Build Time:');
        Object.keys(process.env).forEach((key) => {
          console.log(`${key}=${process.env[key]}`);
        });
      },
    },
  };
}
