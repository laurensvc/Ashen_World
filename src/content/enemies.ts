import type { EnemyDefinition } from '../types';

export const enemies: Record<string, EnemyDefinition> = {
  ashStalker: {
    id: 'ashStalker',
    name: 'Ash Stalker',
    maxHp: 22,
    role: 'Basic attacker',
    intents: [
      { label: 'Circling… gathering ash', telegraphCharge: 3 },
      { label: 'Claw from the ash', damage: 6, damageUsesCharge: true },
    ],
    rewards: { wood: 3, iron: 1 },
  },
  cinderGuard: {
    id: 'cinderGuard',
    name: 'Cinder Guard',
    maxHp: 28,
    role: 'Defender',
    intents: [
      { label: 'Brace for impact', telegraphCharge: 2 },
      { label: 'Shield bash', damage: 5, damageUsesCharge: true },
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
      { label: 'Gurgling…', telegraphCharge: 2 },
      { label: 'Spit poison', poison: 2 },
      { label: 'Bite from the hollow', damage: 7, damageUsesCharge: true },
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
      { label: 'Draws back the hammer…', telegraphCharge: 4 },
      { label: 'Hammer fall', damage: 10, damageUsesCharge: true },
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
      { label: 'Rakes cinders into a storm', telegraphCharge: 5 },
      { label: 'Cinder cleave', damage: 6, damageUsesCharge: true },
      { label: 'Black shield', block: 12 },
      { label: 'Punishing strike', damage: 14 },
    ],
    rewards: { wood: 8, iron: 5, relicShards: 1, blueprintScraps: 1 },
  },
};
