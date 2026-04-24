import type { ResourceId, Resources } from '../types';

/** Display order for resource UI (single source of truth). */
export const resourceDisplayOrder: ResourceId[] = ['wood', 'iron', 'herbs', 'food', 'relicShards', 'blueprintScraps'];

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
