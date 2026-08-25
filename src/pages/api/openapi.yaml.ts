// src/pages/api/openapi.yaml.ts
//
// YAML mirror of /openapi.json at the other conventional discovery path —
// see src/data/openapi.ts for the spec content and scope notes.
import type { APIRoute } from 'astro';
import { stringify } from 'yaml';
import { openApiSpec } from '@data/openapi';

export const GET: APIRoute = () => {
  return new Response(stringify(openApiSpec), {
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
