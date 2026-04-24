import type { CombatPulseType } from '../types';

import { combatPanelAtRest } from './combatMotionPresets';

/**
 * Panel motion is kept at rest so pulses do not shift layout on every action.
 * Combat feedback uses CSS `::after` flashes on `.pulse-*` classes instead.
 */
export const getCombatPanelAnimation = (
  _pulse: CombatPulseType | undefined,
  _side: 'player' | 'enemy',
  reduceMotion: boolean | null,
) => {
  if (reduceMotion) return combatPanelAtRest;
  return combatPanelAtRest;
};
