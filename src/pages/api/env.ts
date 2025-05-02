import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request: _request }) => {
  // Initialize empty objects for both environment types
  let metaEnv: Record<string, any> = {};
  let processEnv: Record<string, any> = {};

  // Check if import.meta.env is available (Astro/Vite)
  if (typeof import.meta.env !== 'undefined') {
    metaEnv = { ...import.meta.env };
  }

  // Check if process.env is available (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    processEnv = { ...process.env };
  }

  // Function to filter sensitive variables and remove "_" variables
  const filterSensitiveVars = (envVars: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(envVars).filter(([key, value]) => {
        // Filter out variables whose name is exactly "_"
        if (key === '_') return false;

        const lowerKey = key.toLowerCase();

        // Check for common sensitive variable patterns in keys
        const sensitiveKeyPatterns = [
          'key',
          'secret',
          'password',
          'token',
          'auth',
          'credential',
          'private',
          'user',
          'home',
          'dir',
          'path',
          'id',
          'login',
          'pwd',
          'logname',
          'shell',
          'pass',
          'cwd',
          'npm',
        ];

        // Check if any sensitive pattern exists in the key
        const hasSensitivePattern = sensitiveKeyPatterns.some((pattern) =>
          lowerKey.includes(pattern)
        );

        // Check if value contains file paths with usernames
        const isValueWithUserPath =
          typeof value === 'string' &&
          (value.includes('/Users/') || value.includes('/home/') || value.includes('\\Users\\'));

        return !(hasSensitivePattern || isValueWithUserPath);
      })
    );
  };

  // Filter both environment variable sets
  const filteredMetaEnv = filterSensitiveVars(metaEnv);
  const filteredProcessEnv = filterSensitiveVars(processEnv);

  // Create the combined response object
  const responseObj = {
    meta_env: filteredMetaEnv,
    process_env: filteredProcessEnv,
  };

  // Return the filtered environment variables as JSON
  return new Response(JSON.stringify(responseObj, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
