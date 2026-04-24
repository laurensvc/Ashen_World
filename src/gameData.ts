import type {
  BuildingDefinition,
  BuildingId,
  CardDefinition,
  EnemyDefinition,
  GameState,
  MapNode,
  ResourceId,
  Resources,
} from './types';

export const resourceLabels: Record<ResourceId, string> = {
  wood: 'Wood',
  iron: 'Iron',
  herbs: 'Herbs',
  food: 'Food',
  relicShards: 'Relic Shards',
  blueprintScraps: 'Blueprints',
};

export const emptyResources = (): Resources => ({
  wood: 0,
  iron: 0,
  herbs: 0,
  food: 0,
  relicShards: 0,
  blueprintScraps: 0,
});

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

export const cards: Record<string, CardDefinition> = {
  strike: {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    type: 'attack',
    description: 'Deal 5 damage.',
    effects: [{ type: 'damage', amount: 5 }],
  },
  guard: {
    id: 'guard',
    name: 'Guard',
    cost: 1,
    type: 'defense',
    description: 'Gain 5 block.',
    effects: [{ type: 'block', amount: 5 }],
  },
  quickStep: {
    id: 'quickStep',
    name: 'Quick Step',
    cost: 0,
    type: 'utility',
    description: 'Draw 1 card.',
    effects: [{ type: 'draw', amount: 1 }],
  },
  villageTool: {
    id: 'villageTool',
    name: 'Village Tool',
    cost: 1,
    type: 'utility',
    description: 'Gain 3 block. Deal 3 damage.',
    effects: [
      { type: 'block', amount: 3 },
      { type: 'damage', amount: 3 },
    ],
  },
  ironStrike: {
    id: 'ironStrike',
    name: 'Iron Strike',
    cost: 1,
    type: 'attack',
    description: 'Deal 7 damage.',
    effects: [{ type: 'damage', amount: 7 }],
    unlock: { building: 'forge', level: 1 },
  },
  temperShield: {
    id: 'temperShield',
    name: 'Temper Shield',
    cost: 1,
    type: 'defense',
    description: 'Gain 7 block.',
    effects: [{ type: 'block', amount: 7 }],
    unlock: { building: 'forge', level: 2 },
  },
  cleavingHook: {
    id: 'cleavingHook',
    name: 'Cleaving Hook',
    cost: 2,
    type: 'attack',
    description: 'Deal 11 damage.',
    effects: [{ type: 'damage', amount: 11 }],
    unlock: { building: 'forge', level: 2 },
  },
  herbalPoultice: {
    id: 'herbalPoultice',
    name: 'Herbal Poultice',
    cost: 1,
    type: 'utility',
    description: 'Heal 5. Exhaust.',
    effects: [{ type: 'heal', amount: 5 }],
    unlock: { building: 'herbalHut', level: 1 },
  },
  rotknife: {
    id: 'rotknife',
    name: 'Rotknife',
    cost: 1,
    type: 'status',
    description: 'Deal 3 damage. Apply 3 poison.',
    effects: [
      { type: 'damage', amount: 3 },
      { type: 'poison', amount: 3 },
    ],
    unlock: { building: 'herbalHut', level: 2 },
  },
  bitterCloud: {
    id: 'bitterCloud',
    name: 'Bitter Cloud',
    cost: 2,
    type: 'status',
    description: 'Apply 6 poison.',
    effects: [{ type: 'poison', amount: 6 }],
    unlock: { building: 'herbalHut', level: 2 },
  },
  brace: {
    id: 'brace',
    name: 'Brace',
    cost: 0,
    type: 'defense',
    description: 'Gain 3 block. Draw 1 card.',
    effects: [
      { type: 'block', amount: 3 },
      { type: 'draw', amount: 1 },
    ],
  },
  markedBlow: {
    id: 'markedBlow',
    name: 'Marked Blow',
    cost: 1,
    type: 'attack',
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: 'damage', amount: 4 },
      { type: 'draw', amount: 1 },
    ],
  },
};

export const enemies: Record<string, EnemyDefinition> = {
  ashStalker: {
    id: 'ashStalker',
    name: 'Ash Stalker',
    maxHp: 22,
    role: 'Basic attacker',
    intents: [{ label: 'Claw for 6', damage: 6 }, { label: 'Circle and guard', block: 4 }],
    rewards: { wood: 3, iron: 1 },
  },
  cinderGuard: {
    id: 'cinderGuard',
    name: 'Cinder Guard',
    maxHp: 28,
    role: 'Defender',
    intents: [{ label: 'Shield bash for 5', damage: 5 }, { label: 'Raise shield', block: 7 }],
    rewards: { wood: 2, iron: 3 },
  },
  hollowSpitter: {
    id: 'hollowSpitter',
    name: 'Hollow Spitter',
    maxHp: 20,
    role: 'Inflictor',
    intents: [{ label: 'Spit poison', poison: 2 }, { label: 'Bite for 7', damage: 7 }],
    rewards: { herbs: 3, wood: 1 },
  },
  graveMender: {
    id: 'graveMender',
    name: 'Grave Mender',
    maxHp: 24,
    role: 'Support',
    intents: [{ label: 'Leech for 4', damage: 4 }, { label: 'Bone ward', block: 8 }],
    rewards: { food: 3, herbs: 1 },
  },
  ironWight: {
    id: 'ironWight',
    name: 'Iron Wight',
    maxHp: 42,
    role: 'Elite',
    intents: [{ label: 'Hammer for 10', damage: 10 }, { label: 'Plate up', block: 10 }],
    rewards: { iron: 5, relicShards: 1 },
  },
  ashKnight: {
    id: 'ashKnight',
    name: 'The Ash Knight',
    maxHp: 58,
    role: 'Boss',
    intents: [
      { label: 'Cinder cleave for 11', damage: 11 },
      { label: 'Black shield', block: 12 },
      { label: 'Punishing strike for 14', damage: 14 },
    ],
    rewards: { wood: 8, iron: 5, relicShards: 1, blueprintScraps: 1 },
  },
};

export const createStarterState = (): GameState => ({
  view: 'village',
  village: {
    resources: {
      wood: 16,
      iron: 6,
      herbs: 4,
      food: 6,
      relicShards: 0,
      blueprintScraps: 0,
    },
    buildingLevels: {
      forge: 0,
      herbalHut: 0,
      watchtower: 0,
    },
    villagers: [],
    unlockedHeroes: ['warden'],
  },
  savedAt: Date.now(),
});

export const createRunMap = (watchtowerLevel: number): MapNode[] => {
  const revealTier = watchtowerLevel >= 2 ? 4 : watchtowerLevel >= 1 ? 2 : 1;
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
