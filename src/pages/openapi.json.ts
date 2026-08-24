// src/pages/openapi.json.ts
//
// OpenAPI spec for agent/tooling discovery — see src/data/openapi.ts for the
// spec content and scope notes, and src/pages/api/openapi.yaml.ts for the
// YAML mirror at the other conventional path.
import type { APIRoute } from 'astro';
import { openApiSpec } from '@data/openapi';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
