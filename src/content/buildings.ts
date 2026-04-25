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
        description: 'Starter deck replaces two Strikes with Iron Strikes for cleaner finisher windows.',
      },
      2: {
        label: 'Heavy pattern',
        description: 'Forge finishers enter drafts and add one extra card choice after combat.',
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
        description: 'Add one Herbal Poultice to the starting deck for puzzle recovery turns.',
      },
      2: {
        label: 'Rotcraft',
        description: 'Poison counters enter drafts and camp recovery increases.',
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
        description: 'See one extra tier of the run map and clearer combat objective hints.',
      },
      2: {
        label: 'Boss omen',
        description: 'Reveal the full route and detailed combat puzzle hinting.',
      },
    },
  },
};
