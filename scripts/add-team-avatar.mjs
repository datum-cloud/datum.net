// Uploads a single team member's headshot to Strapi and links it to their
// `avatar` field. Use this for onboarding a new hire's avatar, or replacing
// one person's headshot without touching anyone else.
//
// Prerequisites:
//   1. The person must already exist as an Author entry in Strapi
//      (Content Manager -> Author -> create, isTeam: true) — this script
//      does not create people, only avatars.
//   2. You have their 3 pre-rendered variants (<slug>-canyon-clay.png,
//      <slug>-glacier-mist.png, <slug>-pine-forge.png), transparent bg,
//      2100x2100 — generated externally, not by this script.
//
// The upload-time ref/refId/field auto-link 500s on this Strapi instance,
// so this does the proven two-step dance instead: upload with
// fileInfo.folder, then PUT /api/authors/:documentId to set the relation.
// The old avatar stays valid until the PUT succeeds — no blank-avatar gap.
//
// Usage:
//   STRAPI_TOKEN=... npx tsx scripts/add-team-avatar.mjs <slug> <color> <path-to-png>
//   npx tsx scripts/add-team-avatar.mjs jon-wick canyon-clay ~/Downloads/jon-wick-canyon-clay.png
//
// Pass --confirm to actually write; omit it to dry-run (looks up the
// person, validates the file, makes zero Strapi writes).

import { getStrapiTeamMembers } from '../src/libs/strapi/authors.ts';
import fs from 'node:fs';

const STRAPI_URL = process.env.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const FOLDER_ID = 2; // "Team Headshots" folder in Strapi Media Library
const VALID_COLORS = ['canyon-clay', 'glacier-mist', 'pine-forge'];

const [, , slug, color, filePath, ...rest] = process.argv;
const LIVE = rest.includes('--confirm');

async function main() {
  if (!slug || !color || !filePath) {
    console.error('Usage: npx tsx scripts/add-team-avatar.mjs <slug> <color> <path-to-png> [--confirm]');
    process.exit(1);
  }
  if (!VALID_COLORS.includes(color)) {
    console.error(`Color must be one of: ${VALID_COLORS.join(', ')}`);
    process.exit(1);
  }
  if (!STRAPI_TOKEN) {
    console.error('STRAPI_TOKEN not set in env — aborting.');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const members = await getStrapiTeamMembers();
  const person = members.find((m) => m.slug === slug);
  if (!person) {
    console.error(
      `No team member with slug "${slug}" found. Create their Author entry in Strapi first (isTeam: true), then re-run.`
    );
    process.exit(1);
  }

  console.log(`Found ${person.name} (documentId=${person.documentId})`);
  console.log(`Current avatar: ${person.avatar?.url ?? '(none)'}`);
  console.log(`New file: ${filePath} (${color})`);

  if (!LIVE) {
    console.log('\nDRY RUN — no Strapi writes performed. Re-run with --confirm to execute.');
    return;
  }

  const form = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  form.append('files', blob, `${slug}-${color}.png`);
  form.append('fileInfo', JSON.stringify({ folder: FOLDER_ID }));

  const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    body: form,
  });
  if (!uploadRes.ok) {
    console.error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
    process.exit(1);
  }
  const uploaded = await uploadRes.json();
  const fileId = uploaded?.[0]?.id;
  console.log(`Uploaded -> file id=${fileId}`);

  const relinkRes = await fetch(`${STRAPI_URL}/api/authors/${person.documentId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { avatar: fileId } }),
  });
  if (!relinkRes.ok) {
    console.error(
      `Relink failed: ${relinkRes.status} ${await relinkRes.text()} (uploaded orphan file id=${fileId} — safe to delete manually)`
    );
    process.exit(1);
  }

  console.log(`Done — ${person.name}'s avatar now points to file id=${fileId}.`);
  console.log(
    'Local dev: clear .cache/strapi-authors* and .cache/strapi-team-members* to see the change on localhost.'
  );
  console.log('Production: Strapi\'s own webhook auto-invalidates the site cache on this content update.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
