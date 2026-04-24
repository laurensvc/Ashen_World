import type { Resources, RewardState } from '../types';

export type EventRewardBranch = {
  title: string;
  message: string;
  resources: Partial<Resources>;
  villager?: string;
};

export type EventDefinition = {
  id: string;
  /** Villager granted on first visit; repeat branch when `villagers` already contains this name. */
  villagerName?: string;
  firstVisit: EventRewardBranch;
  repeatVisit: EventRewardBranch;
};

export const eventsById: Record<string, EventDefinition> = {
  scout: {
    id: 'scout',
    villagerName: 'Scout',
    firstVisit: {
      title: 'Lantern in the Brambles',
      message: 'A trapped Scout swears service to the village if escorted home.',
      resources: { food: 2, wood: 2 },
      villager: 'Scout',
    },
    repeatVisit: {
      title: 'Buried waystones',
      message: 'The Scout marks old stones that lead to a cache under the road.',
      resources: { wood: 4, iron: 2 },
    },
  },
};

export type CampRewardConfig = {
  healHp: number;
  title: string;
  message: string;
  resources: Partial<Resources>;
};

/** Per camp node id; falls back to `defaultCampReward` when missing. */
export const campRewardsByNodeId: Record<string, CampRewardConfig> = {
  'camp-1': {
    healHp: 12,
    title: 'Cold Camp',
    message: 'The Warden binds wounds beside a fire that gives no warmth.',
    resources: { food: 2 },
  },
};

export const defaultCampReward: CampRewardConfig = {
  healHp: 12,
  title: 'Camp',
  message: 'The Warden rests.',
  resources: { food: 1 },
};

export const resolveEventReward = (
  sourceNodeId: string,
  eventId: string | undefined,
  villagerAlreadyRescued: boolean,
): RewardState => {
  const def: EventDefinition = eventId ? (eventsById[eventId] ?? eventsById.scout) : eventsById.scout;
  const branch = def.villagerName && villagerAlreadyRescued ? def.repeatVisit : def.firstVisit;
  return {
    sourceNodeId,
    title: branch.title,
    message: branch.message,
    cardOptions: [],
    resources: branch.resources,
    villager: branch.villager,
    nextView: 'map',
  };
};
