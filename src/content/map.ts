import type { MapNode } from '../types';
import { eventsById } from './events';

/** Max map tier revealed at game start by watchtower level (0 / 1 / 2+). */
export const mapInitialRevealTier = (watchtowerLevel: number): number =>
  watchtowerLevel >= 2 ? 3 : watchtowerLevel >= 1 ? 2 : 1;

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return (): number => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleIds = (ids: string[], rng: () => number): string[] => {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const EVENT_POOL = ['scout', 'marrowWell', 'cinderPilgrim', 'waystoneMerchants', 'ashHermit'] as const;

const TIER1_COMBAT_ENEMIES = ['ashStalker', 'cinderGuard', 'hollowSpitter', 'graveMender', 'emberSeer'] as const;
const TIER2_COMBAT_ENEMIES = [
  'ashStalker',
  'cinderGuard',
  'hollowSpitter',
  'graveMender',
  'ashBulwark',
  'emberSeer',
  'sootReaver',
  'wickHowler',
  'kilnSentinel',
] as const;
const ELITE_ENEMIES = ['ironWight', 'pyreKnight', 'duskTemplar'] as const;

const nextEnemy = (pool: readonly string[], idx: number): string => pool[idx % pool.length] ?? 'ashStalker';

/**
 * Map graph; `revealed` is overwritten by `mapInitialRevealTier(watchtowerLevel)`.
 * `runSeed` rotates combat encounters and which event sits at `event-1`.
 */
export const createRunMap = (watchtowerLevel: number, runSeed: number): MapNode[] => {
  const revealTier = mapInitialRevealTier(watchtowerLevel);
  const rng = mulberry32(runSeed);
  const earlyCombat = shuffleIds([...TIER1_COMBAT_ENEMIES], rng);
  const lateCombat = shuffleIds([...TIER2_COMBAT_ENEMIES], rng);
  const elitePool = shuffleIds([...ELITE_ENEMIES], rng);

  const eventIdx = Math.floor(rng() * EVENT_POOL.length);
  const eventId = EVENT_POOL[eventIdx] ?? 'scout';
  const eventLabel = eventsById[eventId]?.mapLabel ?? 'Unknown road';

  const nodes: MapNode[] = [
    {
      id: 'start',
      type: 'start',
      label: 'Village Gate',
      tier: 0,
      revealed: true,
      resolved: true,
      connectedNodeIds: ['road-1a', 'road-1b'],
    },
    {
      id: 'road-1a',
      type: 'combat',
      label: 'Ash Ditch',
      enemyId: nextEnemy(earlyCombat, 0),
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['road-2a', 'event-1'],
    },
    {
      id: 'road-1b',
      type: 'combat',
      label: 'Collapsed Toll',
      enemyId: nextEnemy(earlyCombat, 1),
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['camp-1', 'road-2b'],
    },
    {
      id: 'road-2a',
      type: 'combat',
      label: 'Bleak Ravine',
      enemyId: nextEnemy(earlyCombat, 2),
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-3a', 'elite-1'],
    },
    {
      id: 'road-2b',
      type: 'combat',
      label: 'Blackened Orchard',
      enemyId: nextEnemy(earlyCombat, 3),
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['event-1', 'road-3b'],
    },
    {
      id: 'event-1',
      type: 'event',
      label: eventLabel,
      eventId,
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-3a', 'road-3b'],
    },
    {
      id: 'camp-1',
      type: 'camp',
      label: 'Cold Camp',
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-3b'],
    },
    {
      id: 'elite-1',
      type: 'elite',
      label: 'Iron Cairn',
      enemyId: elitePool[0] ?? 'ironWight',
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-4a', 'camp-2'],
    },
    {
      id: 'road-3a',
      type: 'combat',
      label: 'Warden Cut',
      enemyId: nextEnemy(lateCombat, 0),
      tier: 3,
      revealed: revealTier >= 3,
      resolved: false,
      connectedNodeIds: ['road-4a', 'elite-2'],
    },
    {
      id: 'road-3b',
      type: 'combat',
      label: 'Sootbridge',
      enemyId: nextEnemy(lateCombat, 1),
      tier: 3,
      revealed: revealTier >= 3,
      resolved: false,
      connectedNodeIds: ['camp-2', 'road-4b'],
    },
    {
      id: 'camp-2',
      type: 'camp',
      label: 'Shale Camp',
      tier: 4,
      revealed: revealTier >= 4,
      resolved: false,
      connectedNodeIds: ['road-4b'],
    },
    {
      id: 'elite-2',
      type: 'elite',
      label: 'Rusted Barrow',
      enemyId: elitePool[1] ?? 'pyreKnight',
      tier: 4,
      revealed: revealTier >= 4,
      resolved: false,
      connectedNodeIds: ['road-5a', 'event-2', 'road-6a'],
    },
    {
      id: 'road-4a',
      type: 'combat',
      label: 'Cinder Causeway',
      enemyId: nextEnemy(lateCombat, 2),
      tier: 4,
      revealed: revealTier >= 4,
      resolved: false,
      connectedNodeIds: ['road-5a', 'event-2'],
    },
    {
      id: 'road-4b',
      type: 'combat',
      label: 'Bone Tangle',
      enemyId: nextEnemy(lateCombat, 3),
      tier: 4,
      revealed: revealTier >= 4,
      resolved: false,
      connectedNodeIds: ['event-2', 'road-5b'],
    },
    {
      id: 'event-2',
      type: 'event',
      label: 'Waystation',
      eventId: EVENT_POOL[(eventIdx + 2) % EVENT_POOL.length] ?? 'waystoneMerchants',
      tier: 5,
      revealed: revealTier >= 5,
      resolved: false,
      connectedNodeIds: ['road-6a', 'road-5b'],
    },
    {
      id: 'road-5a',
      type: 'combat',
      label: 'Thorned Gate',
      enemyId: nextEnemy(lateCombat, 4),
      tier: 5,
      revealed: revealTier >= 5,
      resolved: false,
      connectedNodeIds: ['road-6a', 'elite-3'],
    },
    {
      id: 'road-5b',
      type: 'combat',
      label: 'Grim Watch',
      enemyId: nextEnemy(lateCombat, 5),
      tier: 5,
      revealed: revealTier >= 5,
      resolved: false,
      connectedNodeIds: ['road-6b', 'camp-3'],
    },
    {
      id: 'elite-3',
      type: 'elite',
      label: 'Dusk Bastion',
      enemyId: elitePool[2] ?? 'duskTemplar',
      tier: 6,
      revealed: revealTier >= 6,
      resolved: false,
      connectedNodeIds: ['road-7'],
    },
    {
      id: 'camp-3',
      type: 'camp',
      label: 'Frostbank Fire',
      tier: 6,
      revealed: revealTier >= 6,
      resolved: false,
      connectedNodeIds: ['road-7'],
    },
    {
      id: 'road-6a',
      type: 'combat',
      label: 'Pyre Steps',
      enemyId: nextEnemy(lateCombat, 6),
      tier: 6,
      revealed: revealTier >= 6,
      resolved: false,
      connectedNodeIds: ['road-7'],
    },
    {
      id: 'road-6b',
      type: 'combat',
      label: 'Gloam Rampart',
      enemyId: nextEnemy(lateCombat, 7),
      tier: 6,
      revealed: revealTier >= 6,
      resolved: false,
      connectedNodeIds: ['road-7'],
    },
    {
      id: 'road-7',
      type: 'combat',
      label: 'Knightfall Approach',
      enemyId: nextEnemy(lateCombat, 8),
      tier: 7,
      revealed: revealTier >= 7,
      resolved: false,
      connectedNodeIds: ['boss'],
    },
    {
      id: 'boss',
      type: 'boss',
      label: 'Ash Knight',
      enemyId: 'ashKnight',
      tier: 8,
      revealed: revealTier >= 8,
      resolved: false,
      connectedNodeIds: [],
    },
  ];

  return nodes;
};

/** Used when revealing nodes after moving on the map (watchtower upgrades vision). */
export const autoRevealCapTier = (watchtowerLevel: number, currentTier: number): number => {
  if (watchtowerLevel >= 2) return 8;
  if (watchtowerLevel >= 1) return currentTier + 2;
  return currentTier + 1;
};
