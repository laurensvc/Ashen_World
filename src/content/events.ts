import type { Resources, RewardState } from '../types';

export type EventRewardBranch = {
  title: string;
  message: string;
  resources: Partial<Resources>;
  villager?: string;
};

export type EventDefinition = {
  id: string;
  /** Shown on the run map node. */
  mapLabel: string;
  /** Villager granted on first visit; repeat branch when `villagers` already contains this name. */
  villagerName?: string;
  firstVisit: EventRewardBranch;
  repeatVisit: EventRewardBranch;
};

export const eventsById: Record<string, EventDefinition> = {
  scout: {
    id: 'scout',
    mapLabel: 'Lantern in the Brambles',
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
  marrowWell: {
    id: 'marrowWell',
    mapLabel: 'Marrow Well',
    firstVisit: {
      title: 'Marrow Well',
      message: 'Cold water rises black as ink. You fill skins and find old iron at the rim.',
      resources: { food: 3, iron: 2 },
    },
    repeatVisit: {
      title: 'Marrow Well',
      message: 'The well remembers you. Scraps of ore glint in the silt.',
      resources: { iron: 3, herbs: 1 },
    },
  },
  cinderPilgrim: {
    id: 'cinderPilgrim',
    mapLabel: 'Cinder Pilgrim',
    villagerName: 'Pilgrim',
    firstVisit: {
      title: 'Cinder Pilgrim',
      message: 'A hooded traveler shares tinder herbs and asks to walk with you to safety.',
      resources: { herbs: 4, food: 1 },
      villager: 'Pilgrim',
    },
    repeatVisit: {
      title: 'Cinder Pilgrim',
      message: 'They leave a wrapped bundle: dried herbs and a strip of blessed cloth.',
      resources: { herbs: 3, wood: 2 },
    },
  },
  waystoneMerchants: {
    id: 'waystoneMerchants',
    mapLabel: 'Waystone Merchants',
    firstVisit: {
      title: 'Waystone Merchants',
      message: 'A lean caravan trades iron for wood at unfair rates—you barter hard and still walk away heavier.',
      resources: { iron: 4, wood: 1 },
    },
    repeatVisit: {
      title: 'Waystone Merchants',
      message: 'They recognize you and toss in an extra strap of iron.',
      resources: { iron: 3, wood: 2 },
    },
  },
  ashHermit: {
    id: 'ashHermit',
    mapLabel: 'Ash Hermit',
    firstVisit: {
      title: 'Ash Hermit',
      message: 'A hermit presses a relic shard into your palm for silence about their hollow.',
      resources: { relicShards: 1, food: 2 },
    },
    repeatVisit: {
      title: 'Ash Hermit',
      message: 'They toss you blueprint scraps without a word.',
      resources: { blueprintScraps: 1, herbs: 2 },
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
