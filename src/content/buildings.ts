import type { BuildingDefinition, BuildingId } from '../types';

/** UI order for building list (matches `BuildingId` coverage). */
export const buildingDisplayOrder: BuildingId[] = ['forge', 'herbalHut', 'watchtower'];

export const buildings: Record<BuildingId, BuildingDefinition> = {
  forge: {
    id: 'forge',
    name: 'Forge',
    description: 'Turns scavenged iron into sharper openings and heavier guard cards.',
    maxLevel: 2,
    upgradeCosts: {
      1: { wood: 8, iron: 4 },
      2: { wood: 12, iron: 8, blueprintScraps: 1 },
    },
    levelEffects: {
      1: {
        label: 'Tempered kit',
        description: 'Starter deck replaces two Strikes with Iron Strikes.',
      },
      2: {
        label: 'Heavy pattern',
        description: 'Forge reward cards enter the draft pool.',
      },
    },
  },
  herbalHut: {
    id: 'herbalHut',
    name: 'Herbal Hut',
    description: 'Keeps the Warden alive long enough to take greedy routes.',
    maxLevel: 2,
    upgradeCosts: {
      1: { wood: 6, herbs: 3 },
      2: { wood: 10, herbs: 7, blueprintScraps: 1 },
    },
    levelEffects: {
      1: {
        label: 'Field poultice',
        description: 'Add one Herbal Poultice to the starting deck.',
      },
      2: {
        label: 'Rotcraft',
        description: 'Poison cards enter the draft pool.',
      },
    },
  },
  watchtower: {
    id: 'watchtower',
    name: 'Watchtower',
    description: 'Reads the road before the road reads you.',
    maxLevel: 2,
    upgradeCosts: {
      1: { wood: 10, food: 4 },
      2: { wood: 14, iron: 4, blueprintScraps: 1 },
    },
    levelEffects: {
      1: {
        label: 'First branch revealed',
        description: 'See one extra tier of the run map.',
      },
      2: {
        label: 'Boss omen',
        description: 'Reveal the full route, including the boss.',
      },
    },
  },
};
