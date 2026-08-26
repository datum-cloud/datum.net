// src/libs/httpProblem.ts
//
// RFC 9457 (Problem Details for HTTP APIs) error responses for this site's
// own public API surface — see src/data/openapi.ts for the documented
// schema. A stable, machine-readable `status` (and `type`) lets an agent
// branch on failures instead of parsing prose; `title`/`detail` are for
// humans reading logs or a debugger.
//
// `type` intentionally defaults to `about:blank`: RFC 9457 §4.2.1 says that
// value means "the problem has no additional semantics beyond that of the
// HTTP status code," which is accurate here — this site doesn't (yet)
// publish per-error-code documentation pages, and pointing `type` at a page
// that doesn't exist would be worse than the default (see the "no
// overclaiming" note in src/data/openapi.ts).

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export type ProblemInput = Omit<ProblemDetails, 'type'> & { type?: string };

export function problemResponse(problem: ProblemInput, init?: { headers?: HeadersInit }): Response {
  const body: ProblemDetails = { type: 'about:blank', ...problem };

  return new Response(JSON.stringify(body), {
    status: problem.status,
    headers: {
      'Content-Type': 'application/problem+json',
      ...init?.headers,
    },
  });
}
