import type { CardDefinition, MetaState, RelicDefinition } from '../types';

export const starterMetaState = (): MetaState => ({
  embers: 0,
  totalRuns: 0,
  runsWon: 0,
  highestEmbersEarnedInRun: 0,
});

export const getMetaTierLabel = (embers: number): string => {
  if (embers >= 30) return 'Ashbound';
  if (embers >= 18) return 'Roadwarden';
  if (embers >= 10) return 'Kindled';
  if (embers >= 4) return 'Sparks';
  return 'Unproven';
};

export const canUseMetaLockedCard = (card: CardDefinition, meta: MetaState): boolean =>
  card.metaUnlockEmbers == null || meta.embers >= card.metaUnlockEmbers;

export const canUseMetaLockedRelic = (relic: RelicDefinition, meta: MetaState): boolean =>
  relic.metaUnlockEmbers == null || meta.embers >= relic.metaUnlockEmbers;

export const computeRunEndEmbers = (params: {
  wonRun: boolean;
  defeatedBoss: boolean;
  completedCombats: number;
  eliteVictories: number;
  rescuedVillagers: number;
}): number => {
  const base = Math.max(1, Math.floor(params.completedCombats / 2));
  const bossBonus = params.defeatedBoss ? 4 : 0;
  const winBonus = params.wonRun ? 2 : 0;
  const eliteBonus = Math.min(2, params.eliteVictories);
  const villagerBonus = Math.min(2, params.rescuedVillagers);
  return base + bossBonus + winBonus + eliteBonus + villagerBonus;
};
