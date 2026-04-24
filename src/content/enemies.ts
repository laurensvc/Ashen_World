import type { EnemyDefinition } from '../types';

export const enemies: Record<string, EnemyDefinition> = {
  ashStalker: {
    id: 'ashStalker',
    name: 'Ash Stalker',
    maxHp: 22,
    role: 'Basic attacker',
    intents: [
      { label: 'Claw for 6', damage: 6 },
      { label: 'Circle and guard', block: 4 },
    ],
    rewards: { wood: 3, iron: 1 },
  },
  cinderGuard: {
    id: 'cinderGuard',
    name: 'Cinder Guard',
    maxHp: 28,
    role: 'Defender',
    intents: [
      { label: 'Shield bash for 5', damage: 5 },
      { label: 'Raise shield', block: 7 },
    ],
    rewards: { wood: 2, iron: 3 },
  },
  hollowSpitter: {
    id: 'hollowSpitter',
    name: 'Hollow Spitter',
    maxHp: 20,
    role: 'Inflictor',
    intents: [
      { label: 'Spit poison', poison: 2 },
      { label: 'Bite for 7', damage: 7 },
    ],
    rewards: { herbs: 3, wood: 1 },
  },
  graveMender: {
    id: 'graveMender',
    name: 'Grave Mender',
    maxHp: 24,
    role: 'Support',
    intents: [
      { label: 'Leech for 4', damage: 4 },
      { label: 'Bone ward', block: 8 },
    ],
    rewards: { food: 3, herbs: 1 },
  },
  ironWight: {
    id: 'ironWight',
    name: 'Iron Wight',
    maxHp: 42,
    role: 'Elite',
    intents: [
      { label: 'Hammer for 10', damage: 10 },
      { label: 'Plate up', block: 10 },
    ],
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
