import type { RelicDefinition } from '../types';

export const relics: Record<string, RelicDefinition> = {
  ashCoin: {
    id: 'ashCoin',
    name: 'Ash-Forged Coin',
    description: 'Start each combat with +1 energy (first turn only).',
    passive: 'firstTurnEnergy',
  },
  brambleCharm: {
    id: 'brambleCharm',
    name: 'Bramble Charm',
    description: 'Whenever you apply poison to an enemy, apply +1 more.',
    passive: 'longPoison',
  },
  wardenBand: {
    id: 'wardenBand',
    name: 'Warden Band',
    description: 'Gain 1 block at the start of every turn.',
    passive: 'turnStartBlock',
  },
};

export const relicDisplayOrder = ['ashCoin', 'brambleCharm', 'wardenBand'] as const;
