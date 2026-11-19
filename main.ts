// Leonida Ledger — The Flagship GTA VI Trophy Guide & Platinum Roadmap (make.fun gta6-trophy-guide-01 entry).
// Built as an offline static companion under app/ with modular ES modules, custom dark Vice City editorial design,
// vendored OFL Bebas Neue display typography, complete 55-trophy dataset with original step-by-step cited unlock strategies,
// 5-phase platinum roadmap, missables radar, spoiler shield, live search/filtering, and localStorage JSON/Markdown backup.
// Hands in app/ and screenshots/ to /output (or MAKEFUN_OUTPUT_DIR) and writes /output/dossier.json via buildDossier.
//
// Serve locally with `node serve.ts --port 8081`, then open http://localhost:8081.
// Outside the grader container:
//   mkdir -p /tmp/out-trophy && MAKEFUN_OUTPUT_DIR=/tmp/out-trophy node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
