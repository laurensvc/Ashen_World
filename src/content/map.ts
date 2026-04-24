import type { MapNode } from '../types';

/** Max map tier revealed at game start by watchtower level (0 / 1 / 2+). */
export const mapInitialRevealTier = (watchtowerLevel: number): number =>
  watchtowerLevel >= 2 ? 4 : watchtowerLevel >= 1 ? 2 : 1;

/**
 * Static map graph. `revealed` is overwritten by `mapInitialRevealTier(watchtowerLevel)`.
 */
export const createRunMap = (watchtowerLevel: number): MapNode[] => {
  const revealTier = mapInitialRevealTier(watchtowerLevel);
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
      enemyId: 'ashStalker',
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['event-1', 'camp-1'],
    },
    {
      id: 'road-2',
      type: 'combat',
      label: 'Collapsed Toll',
      enemyId: 'cinderGuard',
      tier: 1,
      revealed: true,
      resolved: false,
      connectedNodeIds: ['event-1', 'elite-1'],
    },
    {
      id: 'event-1',
      type: 'event',
      label: 'Lantern in the Brambles',
      eventId: 'scout',
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
      enemyId: 'hollowSpitter',
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
