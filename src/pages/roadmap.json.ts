import roadmaps from '@/src/content/roadmaps.json';
// console.log(roadmaps);
export function GET() {
  return new Response(JSON.stringify(roadmaps), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
