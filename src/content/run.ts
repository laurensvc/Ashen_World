import type { BuildingId, GameState, HeroId, MetaState } from '../types';
import { canUseMetaLockedCard } from './metaProgression';
import { cards } from './cards';
/** Combat / deck tuning. */
export const combatBalance = {
  handSize: 5,
  turnEnergy: 3,
  /** Shuffle offset when opening combat draw pile. */
  combatDrawRotate: 3,
  /** Rotation applied when reshuffling discard into draw. */
  discardReshuffleRotate: 2,
} as const;

export const runBalance = {
  fallbackEnemyId: 'ashStalker',
  rewardPickCount: 3,
} as const;

export const computeBonusCardDraftCount = (buildingLevels: Record<BuildingId, number>): number =>
  buildingLevels.forge >= 2 ? 1 : 0;

export const computeCampBonusHeal = (buildingLevels: Record<BuildingId, number>): number =>
  buildingLevels.herbalHut >= 2 ? 4 : buildingLevels.herbalHut >= 1 ? 2 : 0;

export const heroProfiles: Record<HeroId, { maxHp: number; starterDeck: readonly string[] }> = {
  warden: {
    maxHp: 52,
    starterDeck: [
      'strike',
      'strike',
      'strike',
      'strike',
      'guard',
      'guard',
      'guard',
      'guard',
      'quickStep',
      'villageTool',
    ],
  },
  ember: {
    maxHp: 46,
    starterDeck: [
      'strike',
      'strike',
      'strike',
      'guard',
      'guard',
      'guard',
      'quickStep',
      'emberSpark',
      'cinderMark',
      'brittleSlash',
    ],
  },
};

/** @deprecated Use `heroProfiles[hero].starterDeck` via `buildStartingDeck`. */
export const starterDeckBase: string[] = [...heroProfiles.warden.starterDeck];

export type DeckReplaceMutation = {
  when: { building: BuildingId; minLevel: number };
  replace: { fromCardId: string; toCardId: string; times: number };
};

export type DeckAddMutation = {
  when: { building: BuildingId; minLevel: number };
  addCardIds: string[];
};

export const deckReplaceMutations: DeckReplaceMutation[] = [
  {
    when: { building: 'forge', minLevel: 1 },
    replace: { fromCardId: 'strike', toCardId: 'ironStrike', times: 2 },
  },
];

export const deckAddMutations: DeckAddMutation[] = [
  {
    when: { building: 'herbalHut', minLevel: 1 },
    addCardIds: ['herbalPoultice'],
  },
];

export const buildStartingDeck = (
  heroId: HeroId,
  buildingLevels: Record<BuildingId, number>,
  meta?: MetaState,
): string[] => {
  const deck = [...heroProfiles[heroId].starterDeck];

  for (const mut of deckReplaceMutations) {
    if (buildingLevels[mut.when.building] >= mut.when.minLevel) {
      for (let i = 0; i < mut.replace.times; i += 1) {
        const idx = deck.indexOf(mut.replace.fromCardId);
        if (idx !== -1) deck.splice(idx, 1, mut.replace.toCardId);
      }
    }
  }

  for (const mut of deckAddMutations) {
    if (buildingLevels[mut.when.building] >= mut.when.minLevel) {
      deck.push(...mut.addCardIds);
    }
  }

  if (buildingLevels.forge >= 2) {
    const forgeCardPool = ['temperShield', 'cleavingHook'].filter((id) => {
      const card = cards[id];
      return card && (!meta || canUseMetaLockedCard(card, meta));
    });
    if (forgeCardPool.length) {
      deck.push(forgeCardPool[buildingLevels.watchtower % forgeCardPool.length]);
    }
  }

  return deck;
};

/** Excluded from village “available reward cards” picker (UI / info). */
export const rewardPoolExcludeForVillage: string[] = [
  'strike',
  'guard',
  'quickStep',
  'villageTool',
  'emberSpark',
  'cinderMark',
  'brittleSlash',
];

/** Excluded from combat reward draft pool rotation. */
export const rewardPoolExcludeForDraft: string[] = ['strike', 'guard', 'emberSpark', 'cinderMark', 'brittleSlash'];

/** Weight offset for rotating the reward card pool (building levels). */
export const rewardPoolRotationWeights: Record<BuildingId, number> = {
  forge: 1,
  herbalHut: 2,
  watchtower: 1,
};

export const computeRewardPoolRotationOffset = (buildingLevels: Record<BuildingId, number>): number =>
  buildingLevels.forge * rewardPoolRotationWeights.forge +
  buildingLevels.herbalHut * rewardPoolRotationWeights.herbalHut +
  buildingLevels.watchtower * rewardPoolRotationWeights.watchtower;

export const starterVillage = {
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
  } as Record<BuildingId, number>,
  villagers: [] as string[],
  unlockedHeroes: ['warden'] as HeroId[],
};

export const unlockHeroIfNew = (heroes: HeroId[], hero: HeroId): HeroId[] =>
  heroes.includes(hero) ? heroes : [...heroes, hero];

export const createStarterState = (): GameState => ({
  view: 'village',
  village: {
    resources: { ...starterVillage.resources },
    buildingLevels: { ...starterVillage.buildingLevels },
    villagers: [...starterVillage.villagers],
    unlockedHeroes: [...starterVillage.unlockedHeroes],
  },
  meta: {
    embers: 0,
    totalRuns: 0,
    runsWon: 0,
    highestEmbersEarnedInRun: 0,
  },
  ui: {
    sequence: 0,
  },
  savedAt: Date.now(),
});
