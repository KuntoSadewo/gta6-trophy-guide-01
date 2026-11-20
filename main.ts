// GTA VI trophy guide — hand-in program (Node 22, standard library only).
//
// It copies this repository's app/ and screenshots/ into /output (or
// MAKEFUN_OUTPUT_DIR outside the grader) and writes /output/dossier.json with
// the vendored make.fun library, so the judge can read the guide.
//
// Grader safety, learned the hard way: /output is a mount point in the grader.
// Never remove the output directory itself — deleting it crashes the run with
// EBUSY. Instead, empty its *contents* entry by entry, then copy fresh files
// in. The directory always survives; only what is inside it is replaced.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Make sure the output directory exists, then clear what is inside it —
// never the directory itself (see the note at the top of this file).
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Same caps the scorer enforces: at most 4 screenshots of 256 KiB, at most
// 993 files / 48 MiB in app/, and the dossier text capped at 160 KiB.
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

// Confirm the hand-in is complete before exiting: the dossier must exist and
// the app folder must have arrived, so a silent partial copy cannot pass.
if (!existsSync(dossierPath) || !existsSync(join(out, 'app', 'index.html'))) {
  throw new Error('hand-in incomplete: dossier.json or app/index.html missing from ' + out);
}
console.log('wrote ' + dossierPath);
