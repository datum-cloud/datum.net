import type { APIRoute } from 'astro';
import { loadEnv } from 'vite';
import path from 'path';
import fs from 'fs';

export const prerender = false;

export const GET: APIRoute = ({ request: _request }) => {
  // Initialize empty objects for all environment types
  let metaEnv: Record<string, any> = {};
  let loadedEnv: Record<string, any> = {};
  let processEnv: Record<string, any> = {};
  const debugInfo: Record<string, any> = {};

  // Check if import.meta.env is available (Astro/Vite)
  if (typeof import.meta.env !== 'undefined') {
    metaEnv = { ...import.meta.env };
  }

  // Load environment variables using Vite's loadEnv
  try {
    // Attempt to get the root directory
    const rootDir = path.resolve(process.cwd());
    // Load variables from .env files for all modes
    // '' loads variables without prefix, 'development' ensures we load .env.development and similar files
    loadedEnv = loadEnv('', rootDir, '');

    // Add debug info about .env file
    const envFilePath = path.join(rootDir, '.env');
    debugInfo.env_file_path = envFilePath;
    debugInfo.env_file_exists = fs.existsSync(envFilePath);
    if (debugInfo.env_file_exists) {
      try {
        const envFileContent = fs.readFileSync(envFilePath, 'utf8');
        // Show first line of env file to confirm it's being found without revealing secrets
        debugInfo.env_file_first_line =
          envFileContent.split('\n')[0] + ' (remaining content hidden)';
      } catch (err) {
        debugInfo.env_file_read_error = String(err);
      }
    }

    // Check if SITE_URL specifically exists in any environment
    debugInfo.site_url_sources = {
      meta_env: metaEnv.SITE_URL ? 'present' : 'absent',
      loaded_env: loadedEnv.SITE_URL ? 'present' : 'absent',
      process_env: processEnv.SITE_URL ? 'present' : 'absent',
    };
  } catch (error) {
    // If loadEnv fails, add error to debug info
    debugInfo.loadEnv_error = String(error);
  }

  // Get process.env variables
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

  // Filter all environment variable sets
  const filteredMetaEnv = filterSensitiveVars(metaEnv);
  const filteredLoadedEnv = filterSensitiveVars(loadedEnv);
  const filteredProcessEnv = filterSensitiveVars(processEnv);

  // Create the combined response object with descriptions
  const responseObj = {
    meta_env: {
      _description: 'Variables from import.meta.env (Astro/Vite runtime environment)',
      ...filteredMetaEnv,
    },
    load_env: {
      _description: "Variables loaded directly from .env files using Vite's loadEnv utility",
      ...filteredLoadedEnv,
    },
    process_env: {
      _description: 'Variables from Node.js process.env',
      ...filteredProcessEnv,
    },
    debug_info: {
      _description: 'Debugging information about environment configuration',
      ...debugInfo,
    },
  };

  // Return the filtered environment variables as JSON
  return new Response(JSON.stringify(responseObj, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
