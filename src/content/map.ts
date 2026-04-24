import type { MapNode } from '../types';
import { eventsById } from './events';

/** Max map tier revealed at game start by watchtower level (0 / 1 / 2+). */
export const mapInitialRevealTier = (watchtowerLevel: number): number =>
  watchtowerLevel >= 2 ? 4 : watchtowerLevel >= 1 ? 2 : 1;

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

const TIER1_COMBAT_ENEMIES = ['ashStalker', 'cinderGuard', 'hollowSpitter', 'graveMender'] as const;

/**
 * Map graph; `revealed` is overwritten by `mapInitialRevealTier(watchtowerLevel)`.
 * `runSeed` rotates combat encounters and which event sits at `event-1`.
 */
export const createRunMap = (watchtowerLevel: number, runSeed: number): MapNode[] => {
  const revealTier = mapInitialRevealTier(watchtowerLevel);
  const rng = mulberry32(runSeed);
  const combatPick = shuffleIds([...TIER1_COMBAT_ENEMIES], rng);
  const road1Enemy = combatPick[0] ?? 'ashStalker';
  const road2Enemy = combatPick[1] ?? 'cinderGuard';
  const road3Enemy = combatPick[2] ?? 'hollowSpitter';

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
      connectedNodeIds: ['road-1', 'road-2'],
    },
    {
      id: 'road-1',
      type: 'combat',
      label: 'Ash Ditch',
      enemyId: road1Enemy,
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['event-1', 'camp-1'],
    },
    {
      id: 'road-2',
      type: 'combat',
      label: 'Collapsed Toll',
      enemyId: road2Enemy,
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['event-1', 'elite-1'],
    },
    {
      id: 'event-1',
      type: 'event',
      label: eventLabel,
      eventId,
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-3', 'boss'],
    },
    {
      id: 'camp-1',
      type: 'camp',
      label: 'Cold Camp',
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['road-3'],
    },
    {
      id: 'elite-1',
      type: 'elite',
      label: 'Iron Cairn',
      enemyId: 'ironWight',
      tier: 2,
      revealed: revealTier >= 2,
      resolved: false,
      connectedNodeIds: ['boss'],
    },
    {
      id: 'road-3',
      type: 'combat',
      label: 'Hollow Copse',
      enemyId: road3Enemy,
      tier: 3,
      revealed: revealTier >= 3,
      resolved: false,
      connectedNodeIds: ['boss'],
    },
    {
      id: 'boss',
      type: 'boss',
      label: 'Ash Knight',
      enemyId: 'ashKnight',
      tier: 4,
      revealed: revealTier >= 4,
      resolved: false,
      connectedNodeIds: [],
    },
  ];

  return nodes;
};

/** Used when revealing nodes after moving on the map (watchtower upgrades vision). */
export const autoRevealCapTier = (watchtowerLevel: number, currentTier: number): number => {
  if (watchtowerLevel >= 2) return 4;
  if (watchtowerLevel >= 1) return currentTier + 2;
  return currentTier + 1;
};
