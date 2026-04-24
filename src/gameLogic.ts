import { campRewardsByNodeId, defaultCampReward, eventsById, resolveEventReward } from './content/events';
import { autoRevealCapTier } from './content/map';
import { narrative } from './content/narrative';
import {
  buildStartingDeck,
  combatBalance,
  computeRewardPoolRotationOffset,
  heroProfiles,
  rewardPoolExcludeForDraft,
  rewardPoolExcludeForVillage,
  runBalance,
  unlockHeroIfNew,
} from './content/run';
import {
  buildings,
  cards,
  createRunMap,
  createStarterState,
  enemies,
  emptyResources,
  relicDisplayOrder,
  relics,
} from './gameData';
import type {
  BuildingId,
  CardEffect,
  CombatPulseType,
  CombatState,
  EnemyIntent,
  GameState,
  HeroId,
  MapNode,
  ResourceId,
  Resources,
  RunState,
} from './types';

const SAVE_KEY = 'ashen-world-save-v1';

let combatHandSlotSeq = 0;
const newHandSlotId = (): string => {
  combatHandSlotSeq += 1;
  return `hand-${combatHandSlotSeq}`;
};

const normalizeCombatHandSlots = (state: GameState): GameState => {
  const run = state.currentRun;
  if (!run?.combat) return state;
  const combat = run.combat;
  const { hand } = combat;
  const prev = (combat as { handSlotIds?: string[] }).handSlotIds;
  if (Array.isArray(prev) && prev.length === hand.length) return state;
  return {
    ...state,
    currentRun: {
      ...run,
      combat: {
        ...combat,
        handSlotIds: hand.map((_, i) => (Array.isArray(prev) ? prev[i] : undefined) ?? newHandSlotId()),
      },
    },
  };
};

export type GameAction =
  | { type: 'upgradeBuilding'; buildingId: BuildingId }
  | { type: 'startRun'; heroId?: HeroId }
  | { type: 'selectNode'; nodeId: string }
  | { type: 'playCard'; handIndex: number }
  | { type: 'endTurn' }
  | { type: 'chooseCardReward'; cardId: string }
  | { type: 'skipCardReward' }
  | { type: 'chooseRelicReward'; relicId: string }
  | { type: 'skipRelicReward' }
  | { type: 'continueFromReward' }
  | { type: 'returnToVillage' }
  | { type: 'reset' };

const combatFieldDefaults = (): Pick<
  CombatState,
  'enemyChargeStacks' | 'enemyExposedBonus' | 'nextDamageIgnoresBlock' | 'playerTurnCount'
> => ({
  enemyChargeStacks: 0,
  enemyExposedBonus: 0,
  nextDamageIgnoresBlock: false,
  playerTurnCount: 0,
});

export const loadGame = (): GameState => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createStarterState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.village || !parsed.view) return createStarterState();
    const merged = { ...parsed, ui: parsed.ui ?? { sequence: 0 } } as GameState;
    if (merged.currentRun) {
      let run = merged.currentRun;
      if (run.runSeed == null) {
        run = { ...run, runSeed: (merged.savedAt ?? Date.now()) >>> 0 };
      }
      if (!run.hero) {
        run = { ...run, hero: 'warden' };
      }
      if (run.combat) {
        run = { ...run, combat: { ...combatFieldDefaults(), ...run.combat } };
      }
      merged.currentRun = run;
    }
    return normalizeCombatHandSlots(merged);
  } catch {
    return createStarterState();
  }
};

export const saveGame = (state: GameState) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
};

export const clearSave = () => {
  localStorage.removeItem(SAVE_KEY);
};

const withUi = (state: GameState, ui: Omit<Partial<GameState['ui']>, 'sequence'>): GameState => ({
  ...state,
  ui: {
    sequence: (state.ui?.sequence ?? 0) + 1,
    ...ui,
  },
});

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'upgradeBuilding':
      return upgradeBuilding(state, action.buildingId);
    case 'startRun':
      return startRun(state, action.heroId);
    case 'selectNode':
      return selectNode(state, action.nodeId);
    case 'playCard':
      return playCard(state, action.handIndex);
    case 'endTurn':
      return endTurn(state);
    case 'chooseCardReward':
      return chooseCardReward(state, action.cardId);
    case 'skipCardReward':
      return chooseCardReward(state);
    case 'chooseRelicReward':
      return chooseRelicReward(state, action.relicId);
    case 'skipRelicReward':
      return skipRelicReward(state);
    case 'continueFromReward':
      return continueFromReward(state);
    case 'returnToVillage':
      return returnToVillage(state);
    case 'reset':
      clearSave();
      return createStarterState();
    default:
      return state;
  }
};

export const canAfford = (resources: Resources, costs: Partial<Resources>) =>
  Object.entries(costs).every(([key, amount]) => resources[key as ResourceId] >= (amount ?? 0));

export const addResources = (base: Resources, gain: Partial<Resources>): Resources => {
  const next = { ...base };
  for (const key of Object.keys(gain) as ResourceId[]) {
    next[key] += gain[key] ?? 0;
  }
  return next;
};

export const subtractResources = (base: Resources, cost: Partial<Resources>): Resources => {
  const next = { ...base };
  for (const key of Object.keys(cost) as ResourceId[]) {
    next[key] -= cost[key] ?? 0;
  }
  return next;
};

export const getAvailableRewardCards = (buildingLevels: Record<BuildingId, number>) =>
  Object.values(cards).filter((card) => {
    if (rewardPoolExcludeForVillage.includes(card.id)) return false;
    if (!card.unlock) return true;
    return buildingLevels[card.unlock.building] >= card.unlock.level;
  });

const upgradeBuilding = (state: GameState, buildingId: BuildingId): GameState => {
  const currentLevel = state.village.buildingLevels[buildingId];
  const definition = buildings[buildingId];
  if (currentLevel >= definition.maxLevel) return state;

  const nextLevel = currentLevel + 1;
  const cost = definition.upgradeCosts[nextLevel] ?? {};
  if (!canAfford(state.village.resources, cost)) return state;

  let unlockedHeroes = state.village.unlockedHeroes;
  if (buildingId === 'forge' && nextLevel === 2) {
    unlockedHeroes = unlockHeroIfNew(unlockedHeroes, 'ember');
  }

  return withUi(
    {
      ...state,
      village: {
        ...state.village,
        resources: subtractResources(state.village.resources, cost),
        buildingLevels: {
          ...state.village.buildingLevels,
          [buildingId]: nextLevel,
        },
        unlockedHeroes,
      },
    },
    {
      lastAction: 'upgrade',
      lastUpgrade: buildingId,
      changedResources: Object.keys(cost) as ResourceId[],
    },
  );
};

const startRun = (state: GameState, heroId?: HeroId): GameState => {
  const buildingLevels = state.village.buildingLevels;
  const hero: HeroId =
    heroId && state.village.unlockedHeroes.includes(heroId) ? heroId : (state.village.unlockedHeroes[0] ?? 'warden');
  const profile = heroProfiles[hero];
  const deck = buildStartingDeck(hero, buildingLevels);
  const runSeed = (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0;

  const run: RunState = {
    hero,
    maxHp: profile.maxHp,
    hp: profile.maxHp,
    deck,
    relics: [],
    runSeed,
    map: createRunMap(buildingLevels.watchtower, runSeed),
    currentNodeId: 'start',
    completedNodeIds: ['start'],
    pendingRewards: emptyResources(),
    pendingVillagers: [],
  };

  return withUi({ ...state, view: 'map', currentRun: run }, { lastAction: 'startRun' });
};

const selectNode = (state: GameState, nodeId: string): GameState => {
  const run = state.currentRun;
  if (!run) return state;

  const current = findNode(run, run.currentNodeId);
  const node = findNode(run, nodeId);
  if (!current || !node || !current.connectedNodeIds.includes(nodeId) || node.resolved) return state;

  const revealedMap = revealReachableNodes(
    run.map.map((mapNode) => (mapNode.id === nodeId ? { ...mapNode, revealed: true } : mapNode)),
    nodeId,
    state.village.buildingLevels.watchtower,
  );

  const updatedRun = {
    ...run,
    currentNodeId: nodeId,
    map: revealedMap,
  };

  if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
    return withUi(
      {
        ...state,
        view: 'combat',
        currentRun: {
          ...updatedRun,
          combat: createCombat(updatedRun, node.enemyId ?? runBalance.fallbackEnemyId),
        },
      },
      { lastAction: 'selectNode', selectedNodeId: nodeId },
    );
  }

  if (node.type === 'camp') {
    const camp = campRewardsByNodeId[node.id] ?? defaultCampReward;
    return withUi(
      {
        ...state,
        view: 'reward',
        currentRun: {
          ...updatedRun,
          hp: Math.min(updatedRun.maxHp, updatedRun.hp + camp.healHp),
          reward: {
            sourceNodeId: node.id,
            title: camp.title,
            message: camp.message,
            cardOptions: [],
            resources: camp.resources,
            nextView: 'map',
          },
        },
      },
      { lastAction: 'camp', selectedNodeId: nodeId, combatPulse: { type: 'heal', target: 'player' } },
    );
  }

  const eventDef = node.eventId ? eventsById[node.eventId] : undefined;
  const villagerAlreadyRescued = eventDef?.villagerName
    ? state.village.villagers.includes(eventDef.villagerName)
    : false;

  return withUi(
    {
      ...state,
      view: 'reward',
      currentRun: {
        ...updatedRun,
        reward: resolveEventReward(node.id, node.eventId, villagerAlreadyRescued),
      },
    },
    { lastAction: 'event', selectedNodeId: nodeId },
  );
};

const firstTurnEnergyBonus = (run: RunState): number => {
  let bonus = 0;
  if (run.hero === 'ember') bonus += 1;
  if (run.relics.includes('ashCoin')) bonus += 1;
  return bonus;
};

const createCombat = (run: RunState, enemyId: string): CombatState => {
  const drawPile = rotate(run.deck, combatBalance.combatDrawRotate);
  const initial = drawCards([], [], drawPile, [], combatBalance.handSize);
  return {
    enemyId,
    enemyHp: enemies[enemyId].maxHp,
    enemyBlock: 0,
    enemyPoison: 0,
    enemyIntentIndex: 0,
    enemyChargeStacks: 0,
    enemyExposedBonus: 0,
    nextDamageIgnoresBlock: false,
    playerTurnCount: 0,
    playerBlock: 0,
    playerPoison: 0,
    energy: combatBalance.turnEnergy + firstTurnEnergyBonus(run),
    hand: initial.hand,
    handSlotIds: initial.handSlotIds,
    drawPile: initial.drawPile,
    discardPile: initial.discardPile,
    exhausted: [],
    log: [`${enemies[enemyId].name} bars the road.`],
  };
};

const playCard = (state: GameState, handIndex: number): GameState => {
  const run = state.currentRun;
  const combat = run?.combat;
  if (!run || !combat) return state;

  const cardId = combat.hand[handIndex];
  const card = cards[cardId];
  if (!card || card.cost > combat.energy) return state;

  let nextCombat: CombatState = {
    ...combat,
    energy: combat.energy - card.cost,
    hand: combat.hand.filter((_, index) => index !== handIndex),
    handSlotIds: combat.handSlotIds.filter((_, index) => index !== handIndex),
    discardPile: card.exhaust ? combat.discardPile : [...combat.discardPile, cardId],
    exhausted: card.exhaust ? [...combat.exhausted, cardId] : combat.exhausted,
    log: [`Played ${card.name}.`, ...combat.log].slice(0, 6),
  };

  let nextRun = { ...run };
  for (const effect of card.effects) {
    const result = applyCardEffect(nextRun, nextCombat, effect);
    nextRun = result.run;
    nextCombat = result.combat;
  }

  const pulse = getCardPulse(card.effects);

  if (nextCombat.enemyHp <= 0) {
    return withUi(finishCombat(state, nextRun, nextCombat), {
      lastAction: 'victory',
      combatPulse: { type: 'victory', cardId, target: 'enemy' },
    });
  }

  return withUi(
    {
      ...state,
      currentRun: {
        ...nextRun,
        combat: nextCombat,
      },
    },
    {
      lastAction: 'playCard',
      combatPulse: {
        type: pulse,
        cardId,
        target: pulse === 'block' || pulse === 'heal' || pulse === 'draw' ? 'player' : 'enemy',
      },
    },
  );
};

const applyCardEffect = (
  run: RunState,
  combat: CombatState,
  effect: CardEffect,
): { run: RunState; combat: CombatState } => {
  switch (effect.type) {
    case 'damage': {
      const bonus = combat.enemyExposedBonus;
      const total = effect.amount + bonus;
      const usesStoredBrittle = combat.nextDamageIgnoresBlock;
      const ignoresBlock = usesStoredBrittle || Boolean(effect.pierce);
      let newBlock = combat.enemyBlock;
      let damageToHp = total;
      if (!ignoresBlock) {
        damageToHp = Math.max(0, total - combat.enemyBlock);
        newBlock = Math.max(0, combat.enemyBlock - total);
      }
      let nextRun = run;
      if (effect.siphonIfPoisoned && combat.enemyPoison > 0) {
        nextRun = {
          ...run,
          hp: Math.min(run.maxHp, run.hp + effect.siphonIfPoisoned),
        };
      }
      const brittleLine = bonus > 0 ? ` (${effect.amount}+${bonus} exposed)` : usesStoredBrittle ? ' (brittle)' : '';
      return {
        run: nextRun,
        combat: {
          ...combat,
          enemyBlock: newBlock,
          enemyHp: Math.max(0, combat.enemyHp - damageToHp),
          enemyExposedBonus: 0,
          nextDamageIgnoresBlock: usesStoredBrittle ? false : combat.nextDamageIgnoresBlock,
          log: [`Dealt ${damageToHp} damage${brittleLine}.`, ...combat.log].slice(0, 6),
        },
      };
    }
    case 'block':
      return {
        run,
        combat: {
          ...combat,
          playerBlock: combat.playerBlock + effect.amount,
          log: [`Gained ${effect.amount} block.`, ...combat.log].slice(0, 6),
        },
      };
    case 'heal':
      return {
        run: { ...run, hp: Math.min(run.maxHp, run.hp + effect.amount) },
        combat: {
          ...combat,
          log: [`Healed ${effect.amount} HP.`, ...combat.log].slice(0, 6),
        },
      };
    case 'poison': {
      const extra = run.relics.includes('brambleCharm') ? 1 : 0;
      const amt = effect.amount + extra;
      return {
        run,
        combat: {
          ...combat,
          enemyPoison: combat.enemyPoison + amt,
          log: [`Applied ${amt} poison${extra ? ' (charm)' : ''}.`, ...combat.log].slice(0, 6),
        },
      };
    }
    case 'applyExposed':
      return {
        run,
        combat: {
          ...combat,
          enemyExposedBonus: combat.enemyExposedBonus + effect.amount,
          log: [`Exposed (+${effect.amount} next damage).`, ...combat.log].slice(0, 6),
        },
      };
    case 'markBrittle':
      return {
        run,
        combat: {
          ...combat,
          nextDamageIgnoresBlock: true,
          log: ['Brittle primed.', ...combat.log].slice(0, 6),
        },
      };
    case 'draw': {
      const drawn = drawCards(combat.hand, combat.handSlotIds, combat.drawPile, combat.discardPile, effect.amount);
      return {
        run,
        combat: {
          ...combat,
          hand: drawn.hand,
          handSlotIds: drawn.handSlotIds,
          drawPile: drawn.drawPile,
          discardPile: drawn.discardPile,
          log: [`Drew ${effect.amount} card.`, ...combat.log].slice(0, 6),
        },
      };
    }
  }
};

const endTurn = (state: GameState): GameState => {
  const run = state.currentRun;
  const combat = run?.combat;
  if (!run || !combat) return state;

  const combatAfterPlayerTurn: CombatState = {
    ...combat,
    enemyExposedBonus: 0,
    nextDamageIgnoresBlock: false,
  };

  const enemy = enemies[combatAfterPlayerTurn.enemyId];
  const intent = enemy.intents[combatAfterPlayerTurn.enemyIntentIndex % enemy.intents.length];
  let enemyHp = combatAfterPlayerTurn.enemyHp;
  let enemyBlock = combatAfterPlayerTurn.enemyBlock;
  let enemyPoison = combatAfterPlayerTurn.enemyPoison;
  let enemyChargeStacks = combatAfterPlayerTurn.enemyChargeStacks;
  const log: string[] = [];

  if (enemyPoison > 0) {
    enemyHp = Math.max(0, enemyHp - enemyPoison);
    log.push(`${enemy.name} suffers ${enemyPoison} poison.`);
    enemyPoison = Math.max(0, enemyPoison - 1);
  }

  if (enemyHp <= 0) {
    return withUi(
      finishCombat(state, run, {
        ...combatAfterPlayerTurn,
        enemyHp,
        enemyPoison,
        log: [...log, ...combatAfterPlayerTurn.log].slice(0, 6),
      }),
      {
        lastAction: 'victory',
        combatPulse: { type: 'victory', target: 'enemy' },
      },
    );
  }

  let hp = run.hp;
  let playerBlock = combatAfterPlayerTurn.playerBlock;
  let playerPoison = combatAfterPlayerTurn.playerPoison;

  if (intent.telegraphCharge != null && intent.telegraphCharge > 0) {
    enemyChargeStacks += intent.telegraphCharge;
    log.push(`${enemy.name} gathers power (+${intent.telegraphCharge}).`);
  }

  let damageAmt = intent.damage ?? 0;
  if (intent.damageUsesCharge) {
    damageAmt += enemyChargeStacks;
    enemyChargeStacks = 0;
  }

  if (damageAmt > 0) {
    const damage = Math.max(0, damageAmt - playerBlock);
    playerBlock = Math.max(0, playerBlock - damageAmt);
    hp = Math.max(0, hp - damage);
    log.push(`${enemy.name} deals ${damage} damage.`);
  }

  if (intent.block) {
    enemyBlock += intent.block;
    log.push(`${enemy.name} gains ${intent.block} block.`);
  }

  if (intent.poison) {
    playerPoison += intent.poison;
    log.push(`${enemy.name} applies ${intent.poison} poison.`);
  }

  if (playerPoison > 0) {
    hp = Math.max(0, hp - playerPoison);
    log.push(`Poison burns for ${playerPoison}.`);
    playerPoison = Math.max(0, playerPoison - 1);
  }

  if (hp <= 0) {
    return withUi(
      {
        ...state,
        view: 'reward',
        currentRun: {
          ...run,
          hp: 0,
          combat: undefined,
          reward: {
            sourceNodeId: run.currentNodeId,
            title: narrative.runDefeat.title,
            message: narrative.runDefeat.message,
            cardOptions: [],
            relicOptions: undefined,
            resources: run.pendingRewards,
            nextView: 'village',
          },
        },
      },
      { lastAction: 'defeat', combatPulse: { type: 'enemyAttack', target: 'player' } },
    );
  }

  const drawn = drawCards(
    [],
    [],
    [...combatAfterPlayerTurn.drawPile],
    [...combatAfterPlayerTurn.discardPile, ...combatAfterPlayerTurn.hand],
    combatBalance.handSize,
  );

  let nextPlayerBlock = playerBlock;
  if (run.relics.includes('wardenBand')) {
    nextPlayerBlock += 1;
    log.push('Warden Band grants 1 block.');
  }

  return withUi(
    {
      ...state,
      currentRun: {
        ...run,
        hp,
        combat: {
          ...combatAfterPlayerTurn,
          enemyHp,
          enemyBlock,
          enemyPoison,
          enemyChargeStacks,
          playerBlock: nextPlayerBlock,
          playerPoison,
          energy: combatBalance.turnEnergy,
          hand: drawn.hand,
          handSlotIds: drawn.handSlotIds,
          drawPile: drawn.drawPile,
          discardPile: drawn.discardPile,
          enemyIntentIndex: combatAfterPlayerTurn.enemyIntentIndex + 1,
          playerTurnCount: combatAfterPlayerTurn.playerTurnCount + 1,
          log: [...log, 'New turn.', ...combatAfterPlayerTurn.log].slice(0, 6),
        },
      },
    },
    {
      lastAction: 'endTurn',
      combatPulse: {
        type: getIntentPulse(intent),
        target:
          intent.telegraphCharge != null && intent.telegraphCharge > 0
            ? 'enemy'
            : damageAmt > 0 || intent.poison
              ? 'player'
              : 'enemy',
      },
    },
  );
};

const pickRelicOptions = (run: RunState): string[] => {
  const available = relicDisplayOrder.filter((id) => !run.relics.includes(id));
  if (available.length === 0) return [];
  return rotate([...available], run.runSeed % 97).slice(0, Math.min(3, available.length));
};

const finishCombat = (state: GameState, run: RunState, combat: CombatState): GameState => {
  const enemy = enemies[combat.enemyId];
  const node = findNode(run, run.currentNodeId);
  const rewardResources = enemy.rewards;
  const cardOptions = node?.type === 'boss' ? [] : pickCardRewards(state.village.buildingLevels);
  const relicOptions = node?.type === 'elite' ? pickRelicOptions(run) : undefined;

  return {
    ...state,
    view: 'reward',
    currentRun: {
      ...markCurrentNodeResolved(run),
      deck: [...run.deck],
      pendingRewards: addResources(run.pendingRewards as Resources, rewardResources),
      combat: undefined,
      reward: {
        sourceNodeId: run.currentNodeId,
        title: `${enemy.name} defeated`,
        message: node?.type === 'boss' ? narrative.combatVictory.bossMessage : narrative.combatVictory.defaultMessage,
        cardOptions,
        relicOptions,
        resources: rewardResources,
        nextView: node?.type === 'boss' ? 'village' : 'map',
      },
    },
  };
};

const chooseCardReward = (state: GameState, cardId?: string): GameState => {
  const run = state.currentRun;
  if (!run?.reward) return state;
  return withUi(
    {
      ...state,
      currentRun: {
        ...run,
        deck: cardId ? [...run.deck, cardId] : run.deck,
        reward: {
          ...run.reward,
          cardOptions: [],
        },
      },
    },
    {
      lastAction: cardId ? 'chooseCard' : 'skipCard',
      chosenCardId: cardId,
      combatPulse: { type: 'draw', cardId, target: 'reward' },
    },
  );
};

const chooseRelicReward = (state: GameState, relicId: string): GameState => {
  const run = state.currentRun;
  const reward = run?.reward;
  if (!run || !reward?.relicOptions?.includes(relicId) || !relics[relicId]) return state;
  return withUi(
    {
      ...state,
      currentRun: {
        ...run,
        relics: [...run.relics, relicId],
        reward: {
          ...reward,
          relicOptions: [],
        },
      },
    },
    { lastAction: 'chooseRelic', chosenRelicId: relicId, combatPulse: { type: 'victory', target: 'reward' } },
  );
};

const skipRelicReward = (state: GameState): GameState => {
  const run = state.currentRun;
  const reward = run?.reward;
  if (!run || !reward?.relicOptions?.length) return state;
  return withUi(
    {
      ...state,
      currentRun: {
        ...run,
        reward: {
          ...reward,
          relicOptions: [],
        },
      },
    },
    { lastAction: 'skipRelic' },
  );
};

const continueFromReward = (state: GameState): GameState => {
  const run = state.currentRun;
  const reward = run?.reward;
  if (!run || !reward) return state;

  if (reward.nextView === 'village') {
    return withUi(returnToVillage(state), { lastAction: 'returnToVillage' });
  }

  const node = findNode(run, reward.sourceNodeId);
  const shouldBankReward = node?.type === 'event' || node?.type === 'camp';

  return withUi(
    {
      ...state,
      view: 'map',
      currentRun: {
        ...markCurrentNodeResolved(run),
        pendingRewards: shouldBankReward
          ? addResources(run.pendingRewards as Resources, reward.resources)
          : run.pendingRewards,
        pendingVillagers:
          shouldBankReward && reward.villager && !run.pendingVillagers.includes(reward.villager)
            ? [...run.pendingVillagers, reward.villager]
            : run.pendingVillagers,
        map: revealReachableNodes(run.map, run.currentNodeId, state.village.buildingLevels.watchtower),
        reward: undefined,
      },
    },
    { lastAction: 'continueFromReward', changedResources: Object.keys(reward.resources) as ResourceId[] },
  );
};

const returnToVillage = (state: GameState): GameState => {
  const run = state.currentRun;
  if (!run) return { ...state, view: 'village' };

  const reward = run.reward;
  const villager = reward?.villager;
  const pendingVillagers = [...run.pendingVillagers, ...(villager ? [villager] : [])];
  const villagers = Array.from(new Set([...state.village.villagers, ...pendingVillagers]));

  return withUi(
    {
      ...state,
      view: 'village',
      village: {
        ...state.village,
        resources: addResources(state.village.resources, run.pendingRewards),
        villagers,
      },
      currentRun: undefined,
    },
    { lastAction: 'returnToVillage', changedResources: Object.keys(run.pendingRewards) as ResourceId[] },
  );
};

const getCardPulse = (effects: CardEffect[]): CombatPulseType => {
  if (effects.some((effect) => effect.type === 'damage')) return 'damage';
  if (effects.some((effect) => effect.type === 'poison')) return 'poison';
  if (effects.some((effect) => effect.type === 'markBrittle')) return 'block';
  if (effects.some((effect) => effect.type === 'applyExposed')) return 'draw';
  if (effects.some((effect) => effect.type === 'block')) return 'block';
  if (effects.some((effect) => effect.type === 'heal')) return 'heal';
  return 'draw';
};

const getIntentPulse = (intent: EnemyIntent): CombatPulseType => {
  if (intent.telegraphCharge != null && intent.telegraphCharge > 0) return 'telegraph';
  const dmg = intent.damage ?? 0;
  if (dmg > 0 || intent.damageUsesCharge) return 'enemyAttack';
  if (intent.poison) return 'enemyPoison';
  return 'enemyBlock';
};

const markCurrentNodeResolved = (run: RunState): RunState => ({
  ...run,
  completedNodeIds: run.completedNodeIds.includes(run.currentNodeId)
    ? run.completedNodeIds
    : [...run.completedNodeIds, run.currentNodeId],
  map: run.map.map((node) => (node.id === run.currentNodeId ? { ...node, resolved: true } : node)),
});

const revealReachableNodes = (map: MapNode[], currentNodeId: string, watchtowerLevel: number): MapNode[] => {
  const current = map.find((node) => node.id === currentNodeId);
  if (!current) return map;
  const autoRevealTier = autoRevealCapTier(watchtowerLevel, current.tier);
  const nextIds = new Set(current.connectedNodeIds);
  return map.map((node) => ({
    ...node,
    revealed: node.revealed || nextIds.has(node.id) || node.tier <= autoRevealTier,
  }));
};

const drawCards = (
  hand: string[],
  handSlotIds: string[],
  drawPile: string[],
  discardPile: string[],
  count: number,
): { hand: string[]; handSlotIds: string[]; drawPile: string[]; discardPile: string[] } => {
  const nextHand = [...hand];
  const nextSlotIds = [...handSlotIds];
  let nextDraw = [...drawPile];
  let nextDiscard = [...discardPile];

  for (let i = 0; i < count; i += 1) {
    if (nextDraw.length === 0) {
      nextDraw = rotate(nextDiscard, combatBalance.discardReshuffleRotate);
      nextDiscard = [];
    }
    const drawn = nextDraw.shift();
    if (drawn) {
      nextHand.push(drawn);
      nextSlotIds.push(newHandSlotId());
    }
  }

  return { hand: nextHand, handSlotIds: nextSlotIds, drawPile: nextDraw, discardPile: nextDiscard };
};

const pickCardRewards = (buildingLevels: Record<BuildingId, number>) => {
  const pool = getRewardPool(buildingLevels);
  return pool.slice(0, runBalance.rewardPickCount).map((card) => card.id);
};

const getRewardPool = (buildingLevels: Record<BuildingId, number>) => {
  const unlocked = Object.values(cards).filter((card) => {
    if (rewardPoolExcludeForDraft.includes(card.id)) return false;
    if (!card.unlock) return true;
    return buildingLevels[card.unlock.building] >= card.unlock.level;
  });

  const offset = computeRewardPoolRotationOffset(buildingLevels);
  return rotate(unlocked, offset);
};

const findNode = (run: RunState, nodeId: string) => run.map.find((node) => node.id === nodeId);

const rotate = <T>(items: T[], offset: number): T[] => {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
};
