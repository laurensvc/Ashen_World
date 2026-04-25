import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'generated');

const CARD_IDS = [
  'strike',
  'guard',
  'quickStep',
  'villageTool',
  'ironStrike',
  'temperShield',
  'cleavingHook',
  'herbalPoultice',
  'rotknife',
  'bitterCloud',
  'brace',
  'markedBlow',
  'cinderMark',
  'brittleSlash',
  'venomStrike',
  'ashTap',
  'emberSpark',
];

const EVENT_IDS = ['scout', 'marrowWell', 'cinderPilgrim', 'waystoneMerchants', 'ashHermit'];
const RELIC_IDS = ['ashCoin', 'brambleCharm', 'wardenBand'];
const UI_IDS = ['village', 'map', 'combat', 'reward'];

const basePalettes = {
  card: [
    [14, 18, 30],
    [219, 73, 47],
    [245, 205, 94],
    [124, 176, 255],
  ],
  event: [
    [9, 12, 22],
    [146, 39, 134],
    [255, 84, 54],
    [250, 218, 112],
  ],
  relic: [
    [6, 8, 14],
    [242, 141, 39],
    [251, 231, 163],
    [141, 201, 255],
  ],
  ui: [
    [10, 10, 16],
    [90, 20, 30],
    [222, 98, 52],
    [250, 228, 145],
  ],
};

const cardPalettes = {
  strike: [
    [8, 10, 18],
    [223, 56, 43],
    [252, 158, 79],
    [252, 232, 170],
  ],
  guard: [
    [8, 12, 20],
    [61, 92, 134],
    [145, 191, 240],
    [237, 247, 255],
  ],
  quickStep: [
    [7, 9, 18],
    [101, 67, 186],
    [102, 178, 244],
    [229, 249, 255],
  ],
  villageTool: [
    [19, 13, 8],
    [146, 83, 41],
    [229, 163, 84],
    [249, 229, 171],
  ],
  ironStrike: [
    [10, 10, 15],
    [94, 101, 117],
    [207, 216, 225],
    [247, 214, 132],
  ],
  temperShield: [
    [8, 11, 17],
    [41, 81, 130],
    [137, 186, 224],
    [232, 245, 252],
  ],
  cleavingHook: [
    [12, 8, 8],
    [147, 42, 29],
    [239, 102, 59],
    [253, 200, 116],
  ],
  herbalPoultice: [
    [8, 12, 10],
    [43, 120, 70],
    [112, 194, 129],
    [236, 251, 215],
  ],
  rotknife: [
    [10, 9, 12],
    [95, 35, 63],
    [180, 80, 118],
    [239, 180, 211],
  ],
  bitterCloud: [
    [8, 11, 10],
    [48, 79, 64],
    [92, 149, 116],
    [214, 236, 201],
  ],
  brace: [
    [7, 11, 18],
    [44, 96, 122],
    [122, 180, 201],
    [241, 252, 253],
  ],
  markedBlow: [
    [11, 9, 16],
    [166, 47, 87],
    [237, 109, 120],
    [253, 216, 164],
  ],
  cinderMark: [
    [10, 8, 8],
    [136, 40, 28],
    [236, 93, 54],
    [255, 196, 116],
  ],
  brittleSlash: [
    [6, 8, 13],
    [95, 104, 133],
    [178, 196, 227],
    [241, 249, 255],
  ],
  venomStrike: [
    [6, 10, 11],
    [34, 108, 82],
    [79, 181, 136],
    [218, 248, 214],
  ],
  ashTap: [
    [8, 10, 18],
    [78, 84, 180],
    [114, 157, 247],
    [221, 239, 255],
  ],
  emberSpark: [
    [10, 8, 11],
    [146, 45, 86],
    [239, 89, 74],
    [253, 192, 118],
  ],
};

const hashString = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const lerp = (a, b, t) => a + (b - a) * t;

const samplePalette = (palette, t) => {
  const s = clamp(t, 0, 1) * (palette.length - 1);
  const i0 = Math.floor(s);
  const i1 = Math.min(palette.length - 1, i0 + 1);
  const f = s - i0;
  return [
    Math.round(lerp(palette[i0][0], palette[i1][0], f)),
    Math.round(lerp(palette[i0][1], palette[i1][1], f)),
    Math.round(lerp(palette[i0][2], palette[i1][2], f)),
  ];
};

const renderArt = ({ width, height, seed, palette, mode = 'swirl', intensity = 1, motif = 0 }) => {
  const png = new PNG({ width, height });
  const rng = mulberry32(seed);
  const cx = width * (0.2 + rng() * 0.6);
  const cy = height * (0.2 + rng() * 0.6);
  const kA = 2.0 + rng() * 6.0;
  const kB = 3 + Math.floor(rng() * 9);
  const kC = 0.6 + rng() * 1.8;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x - cx) / width;
      const ny = (y - cy) / height;
      const r = Math.hypot(nx, ny);
      const a = Math.atan2(ny, nx);

      let signal = 0;
      if (mode === 'swirl') {
        signal =
          Math.sin((a + r * kA) * kB) * 0.45 +
          Math.cos((nx - ny) * 11.0 + seed * 0.0002) * 0.3 +
          Math.sin((nx + ny) * 19.0 - seed * 0.0001) * 0.25;
      } else if (mode === 'rings') {
        signal =
          Math.sin(r * 48 * kC - a * kA) * 0.55 +
          Math.cos((nx * nx - ny * ny) * 28 + seed * 0.00007) * 0.25 +
          Math.sin(a * (kB + 2)) * 0.2;
      } else if (mode === 'shards') {
        const d1 = Math.abs(nx * (1.5 + kC) + ny * (0.8 + kC * 0.6));
        const d2 = Math.abs(nx * (0.5 + kC * 0.7) - ny * (1.9 + kC));
        signal =
          Math.cos(d1 * 44 + seed * 0.00009) * 0.42 +
          Math.sin(d2 * 37 - seed * 0.00006) * 0.38 +
          Math.cos((a + r * kA) * 5) * 0.2;
      } else if (mode === 'grid') {
        signal =
          Math.sin(nx * 42 * kC) * 0.35 +
          Math.cos(ny * 38 * (2 - kC * 0.4)) * 0.35 +
          Math.sin((nx + ny) * 27 + a * 4) * 0.3;
      } else {
        signal =
          Math.sin((a + r * kA) * kB) * 0.4 +
          Math.cos((nx - ny) * 13.0 + seed * 0.00012) * 0.35 +
          Math.sin((nx + ny) * 24.0 - seed * 0.00011) * 0.25;
      }

      // Card-specific motif channel to force silhouette divergence.
      if (motif === 1) {
        signal += Math.exp(-Math.pow(nx * 3.2, 2)) * 0.42; // vertical slash
      } else if (motif === 2) {
        signal += Math.exp(-Math.pow(ny * 3.2, 2)) * 0.42; // horizontal shield
      } else if (motif === 3) {
        signal += (1 - clamp(Math.abs(nx) + Math.abs(ny), 0, 1)) * 0.5; // diamond core
      } else if (motif === 4) {
        signal += Math.sin(a * 6) * 0.25 + Math.cos(r * 30) * 0.2; // starburst
      } else if (motif === 5) {
        signal += Math.cos((nx * 2 + ny * 2) * 18) * 0.28; // cross waves
      }

      const v = clamp(0.5 + signal * intensity - r * (1.25 + 0.35 * kC), 0, 1);
      const glow = clamp(1 - r * 2.4, 0, 1);
      const c = samplePalette(palette, clamp(v * 0.75 + glow * 0.25, 0, 1));

      const i = (y * width + x) * 4;
      png.data[i] = c[0];
      png.data[i + 1] = c[1];
      png.data[i + 2] = c[2];
      png.data[i + 3] = 255;
    }
  }

  return png;
};

const writeImage = async (filePath, png) =>
  new Promise((resolve, reject) => {
    const stream = png.pack();
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', async () => {
      await fs.writeFile(filePath, Buffer.concat(chunks));
      resolve();
    });
    stream.on('error', reject);
  });

const renderSet = async ({ target, ids, width, height, palette, baseSeed }) => {
  for (const id of ids) {
    const seed = hashString(`${target}:${id}:${baseSeed}`);
    const png = renderArt({ width, height, seed, palette });
    await writeImage(path.join(OUT_DIR, `${target}-${id}.png`), png);
  }
};

const CARD_BASE_SEED = 11031;
const cardGeneratorsById = {
  strike: { generator: 'strikeSlash', mode: 'shards', intensity: 1.3, motif: 1 },
  guard: { generator: 'guardBulwark', mode: 'rings', intensity: 1.0, motif: 2 },
  quickStep: { generator: 'quickStepFlux', mode: 'grid', intensity: 1.25, motif: 5 },
  villageTool: { generator: 'villageToolForge', mode: 'swirl', intensity: 1.05, motif: 3 },
  ironStrike: { generator: 'ironStrikeEdge', mode: 'shards', intensity: 1.35, motif: 1 },
  temperShield: { generator: 'temperShieldPlate', mode: 'rings', intensity: 1.05, motif: 2 },
  cleavingHook: { generator: 'cleavingHookArc', mode: 'shards', intensity: 1.4, motif: 4 },
  herbalPoultice: { generator: 'herbalPoulticeBloom', mode: 'swirl', intensity: 0.95, motif: 3 },
  rotknife: { generator: 'rotknifeToxin', mode: 'grid', intensity: 1.25, motif: 1 },
  bitterCloud: { generator: 'bitterCloudFume', mode: 'swirl', intensity: 0.85, motif: 5 },
  brace: { generator: 'braceAnchor', mode: 'rings', intensity: 1.0, motif: 2 },
  markedBlow: { generator: 'markedBlowSigil', mode: 'grid', intensity: 1.2, motif: 4 },
  cinderMark: { generator: 'cinderMarkBrand', mode: 'shards', intensity: 1.25, motif: 3 },
  brittleSlash: { generator: 'brittleSlashFracture', mode: 'shards', intensity: 1.45, motif: 1 },
  venomStrike: { generator: 'venomStrikeSpiral', mode: 'swirl', intensity: 1.1, motif: 4 },
  ashTap: { generator: 'ashTapConduit', mode: 'grid', intensity: 1.2, motif: 5 },
  emberSpark: { generator: 'emberSparkPulse', mode: 'rings', intensity: 1.35, motif: 4 },
};

const renderCardSet = async () => {
  for (const id of CARD_IDS) {
    const conf = cardGeneratorsById[id];
    if (!conf) throw new Error(`Missing per-card generator for "${id}"`);
    const seed = hashString(`card:${id}:${CARD_BASE_SEED}:${conf.generator}`);
    const palette = cardPalettes[id] ?? basePalettes.card;
    const png = renderArt({
      width: 512,
      height: 320,
      seed,
      palette,
      mode: conf.mode,
      intensity: conf.intensity,
      motif: conf.motif,
    });
    await writeImage(path.join(OUT_DIR, `card-${id}.png`), png);
  }
};

const main = async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await renderCardSet();

  await renderSet({
    target: 'event',
    ids: EVENT_IDS,
    width: 1024,
    height: 512,
    palette: basePalettes.event,
    baseSeed: 22063,
  });

  await renderSet({
    target: 'relic',
    ids: RELIC_IDS,
    width: 256,
    height: 256,
    palette: basePalettes.relic,
    baseSeed: 33097,
  });

  await renderSet({
    target: 'ui',
    ids: UI_IDS,
    width: 1600,
    height: 900,
    palette: basePalettes.ui,
    baseSeed: 44071,
  });

  console.log(`Generated deterministic assets in ${OUT_DIR}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
