import { buildings, cards, createRunMap, createStarterState, enemies, emptyResources } from './gameData';
import type {
  BuildingId,
  CardEffect,
  CombatState,
  GameState,
  MapNode,
  ResourceId,
  Resources,
  RewardState,
  RunState,
} from './types';

const SAVE_KEY = 'ashen-world-save-v1';
const handSize = 5;
const turnEnergy = 3;

export type GameAction =
  | { type: 'upgradeBuilding'; buildingId: BuildingId }
  | { type: 'startRun' }
  | { type: 'selectNode'; nodeId: string }
  | { type: 'playCard'; handIndex: number }
  | { type: 'endTurn' }
  | { type: 'chooseCardReward'; cardId: string }
  | { type: 'skipCardReward' }
  | { type: 'continueFromReward' }
  | { type: 'returnToVillage' }
  | { type: 'reset' };

export const loadGame = (): GameState => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createStarterState();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.village || !parsed.view) return createStarterState();
    return parsed;
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

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'upgradeBuilding':
      return upgradeBuilding(state, action.buildingId);
    case 'startRun':
      return startRun(state);
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
    if (['strike', 'guard', 'quickStep', 'villageTool'].includes(card.id)) return false;
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

  return {
    ...state,
    village: {
      ...state.village,
      resources: subtractResources(state.village.resources, cost),
      buildingLevels: {
        ...state.village.buildingLevels,
        [buildingId]: nextLevel,
      },
    },
  };
};

const startRun = (state: GameState): GameState => {
  const buildingLevels = state.village.buildingLevels;
  const deck = ['strike', 'strike', 'strike', 'strike', 'guard', 'guard', 'guard', 'guard', 'quickStep', 'villageTool'];

  if (buildingLevels.forge >= 1) {
    deck.splice(deck.indexOf('strike'), 1, 'ironStrike');
    deck.splice(deck.indexOf('strike'), 1, 'ironStrike');
  }

  if (buildingLevels.herbalHut >= 1) {
    deck.push('herbalPoultice');
  }

  const run: RunState = {
    hero: 'warden',
    maxHp: 52,
    hp: 52,
    deck,
    relics: [],
    map: createRunMap(buildingLevels.watchtower),
    currentNodeId: 'start',
    completedNodeIds: ['start'],
    pendingRewards: emptyResources(),
    pendingVillagers: [],
  };

  return { ...state, view: 'map', currentRun: run };
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
    return {
      ...state,
      view: 'combat',
      currentRun: {
        ...updatedRun,
        combat: createCombat(node.enemyId ?? 'ashStalker', updatedRun.deck),
      },
    };
  }

  if (node.type === 'camp') {
    return {
      ...state,
      view: 'reward',
      currentRun: {
        ...updatedRun,
        hp: Math.min(updatedRun.maxHp, updatedRun.hp + 12),
        reward: {
          sourceNodeId: node.id,
          title: 'Cold Camp',
          message: 'The Warden binds wounds beside a fire that gives no warmth.',
          cardOptions: [],
          resources: { food: 2 },
          nextView: 'map',
        },
      },
    };
  }

  return {
    ...state,
    view: 'reward',
    currentRun: {
      ...updatedRun,
      reward: createEventReward(node.id, state.village.villagers.includes('Scout')),
    },
  };
};

const createCombat = (enemyId: string, deck: string[]): CombatState => {
  const drawPile = rotate(deck, 3);
  const initial = drawCards([], drawPile, [], handSize);
  return {
    enemyId,
    enemyHp: enemies[enemyId].maxHp,
    enemyBlock: 0,
    enemyPoison: 0,
    enemyIntentIndex: 0,
    playerBlock: 0,
    playerPoison: 0,
    energy: turnEnergy,
    hand: initial.hand,
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
    discardPile: card.id === 'herbalPoultice' ? combat.discardPile : [...combat.discardPile, cardId],
    exhausted: card.id === 'herbalPoultice' ? [...combat.exhausted, cardId] : combat.exhausted,
    log: [`Played ${card.name}.`, ...combat.log].slice(0, 6),
  };

  let nextRun = { ...run };
  for (const effect of card.effects) {
    const result = applyCardEffect(nextRun, nextCombat, effect);
    nextRun = result.run;
    nextCombat = result.combat;
  }

  if (nextCombat.enemyHp <= 0) {
    return finishCombat(state, nextRun, nextCombat);
  }

  return {
    ...state,
    currentRun: {
      ...nextRun,
      combat: nextCombat,
    },
  };
};

const applyCardEffect = (run: RunState, combat: CombatState, effect: CardEffect): { run: RunState; combat: CombatState } => {
  switch (effect.type) {
    case 'damage': {
      const remainingBlock = Math.max(0, combat.enemyBlock - effect.amount);
      const damage = Math.max(0, effect.amount - combat.enemyBlock);
      return {
        run,
        combat: {
          ...combat,
          enemyBlock: remainingBlock,
          enemyHp: Math.max(0, combat.enemyHp - damage),
          log: [`Dealt ${damage} damage.`, ...combat.log].slice(0, 6),
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
    case 'poison':
      return {
        run,
        combat: {
          ...combat,
          enemyPoison: combat.enemyPoison + effect.amount,
          log: [`Applied ${effect.amount} poison.`, ...combat.log].slice(0, 6),
        },
      };
    case 'draw': {
      const drawn = drawCards(combat.hand, combat.drawPile, combat.discardPile, effect.amount);
      return {
        run,
        combat: {
          ...combat,
          hand: drawn.hand,
          drawPile: drawn.drawPile,
          discardPile: drawn.discardPile,
          log: [`Drew ${effect.amount} card.`, ...combat.log].slice(0, 6),
        },
      };
    }
    default:
      return { run, combat };
  }
};

const endTurn = (state: GameState): GameState => {
  const run = state.currentRun;
  const combat = run?.combat;
  if (!run || !combat) return state;

  const enemy = enemies[combat.enemyId];
  const intent = enemy.intents[combat.enemyIntentIndex % enemy.intents.length];
  let enemyHp = combat.enemyHp;
  let enemyBlock = combat.enemyBlock;
  let enemyPoison = combat.enemyPoison;
  const log: string[] = [];

  if (enemyPoison > 0) {
    enemyHp = Math.max(0, enemyHp - enemyPoison);
    log.push(`${enemy.name} suffers ${enemyPoison} poison.`);
    enemyPoison = Math.max(0, enemyPoison - 1);
  }

  if (enemyHp <= 0) {
    return finishCombat(state, run, { ...combat, enemyHp, enemyPoison, log: [...log, ...combat.log].slice(0, 6) });
  }

  let hp = run.hp;
  let playerBlock = combat.playerBlock;
  let playerPoison = combat.playerPoison;

  if (intent.damage) {
    const damage = Math.max(0, intent.damage - playerBlock);
    playerBlock = Math.max(0, playerBlock - intent.damage);
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
    return {
      ...state,
      view: 'reward',
      currentRun: {
        ...run,
        hp: 0,
        combat: undefined,
        reward: {
          sourceNodeId: run.currentNodeId,
          title: 'The road takes its due',
          message: 'The Warden returns broken, carrying only what could be dragged from the ash.',
          cardOptions: [],
          resources: run.pendingRewards,
          nextView: 'village',
        },
      },
    };
  }

  const drawn = drawCards([], [...combat.drawPile], [...combat.discardPile, ...combat.hand], handSize);

  return {
    ...state,
    currentRun: {
      ...run,
      hp,
      combat: {
        ...combat,
        enemyHp,
        enemyBlock,
        enemyPoison,
        playerBlock,
        playerPoison,
        energy: turnEnergy,
        hand: drawn.hand,
        drawPile: drawn.drawPile,
        discardPile: drawn.discardPile,
        enemyIntentIndex: combat.enemyIntentIndex + 1,
        log: [...log, 'New turn.', ...combat.log].slice(0, 6),
      },
    },
  };
};

const finishCombat = (state: GameState, run: RunState, combat: CombatState): GameState => {
  const enemy = enemies[combat.enemyId];
  const node = findNode(run, run.currentNodeId);
  const rewardResources = enemy.rewards;
  const cardOptions = node?.type === 'boss' ? [] : pickCardRewards(state.village.buildingLevels);

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
        message:
          node?.type === 'boss'
            ? 'The Ash Knight falls. A blueprint plate is pried from the blackened armor.'
            : 'The road quiets. Choose what the Warden carries forward.',
        cardOptions,
        resources: rewardResources,
        nextView: node?.type === 'boss' ? 'village' : 'map',
      },
    },
  };
};

const chooseCardReward = (state: GameState, cardId?: string): GameState => {
  const run = state.currentRun;
  if (!run?.reward) return state;
  return {
    ...state,
    currentRun: {
      ...run,
      deck: cardId ? [...run.deck, cardId] : run.deck,
      reward: {
        ...run.reward,
        cardOptions: [],
      },
    },
  };
};

const continueFromReward = (state: GameState): GameState => {
  const run = state.currentRun;
  const reward = run?.reward;
  if (!run || !reward) return state;

  if (reward.nextView === 'village') {
    return returnToVillage(state);
  }

  const node = findNode(run, reward.sourceNodeId);
  const shouldBankReward = node?.type === 'event' || node?.type === 'camp';

  return {
    ...state,
    view: 'map',
    currentRun: {
      ...markCurrentNodeResolved(run),
      pendingRewards: shouldBankReward ? addResources(run.pendingRewards as Resources, reward.resources) : run.pendingRewards,
      pendingVillagers:
        shouldBankReward && reward.villager && !run.pendingVillagers.includes(reward.villager)
          ? [...run.pendingVillagers, reward.villager]
          : run.pendingVillagers,
      map: revealReachableNodes(run.map, run.currentNodeId, state.village.buildingLevels.watchtower),
      reward: undefined,
    },
  };
};

const returnToVillage = (state: GameState): GameState => {
  const run = state.currentRun;
  if (!run) return { ...state, view: 'village' };

  const reward = run.reward;
  const villager = reward?.villager;
  const pendingVillagers = [...run.pendingVillagers, ...(villager ? [villager] : [])];
  const villagers = Array.from(new Set([...state.village.villagers, ...pendingVillagers]));

  return {
    ...state,
    view: 'village',
    village: {
      ...state.village,
      resources: addResources(state.village.resources, run.pendingRewards),
      villagers,
    },
    currentRun: undefined,
  };
};

const createEventReward = (sourceNodeId: string, scoutAlreadyRescued: boolean): RewardState => ({
  sourceNodeId,
  title: scoutAlreadyRescued ? 'Buried waystones' : 'Lantern in the Brambles',
  message: scoutAlreadyRescued
    ? 'The Scout marks old stones that lead to a cache under the road.'
    : 'A trapped Scout swears service to the village if escorted home.',
  cardOptions: [],
  resources: scoutAlreadyRescued ? { wood: 4, iron: 2 } : { food: 2, wood: 2 },
  villager: scoutAlreadyRescued ? undefined : 'Scout',
  nextView: 'map',
});

const markCurrentNodeResolved = (run: RunState): RunState => ({
  ...run,
  completedNodeIds: run.completedNodeIds.includes(run.currentNodeId) ? run.completedNodeIds : [...run.completedNodeIds, run.currentNodeId],
  map: run.map.map((node) => (node.id === run.currentNodeId ? { ...node, resolved: true } : node)),
});

const revealReachableNodes = (map: MapNode[], currentNodeId: string, watchtowerLevel: number): MapNode[] => {
  const current = map.find((node) => node.id === currentNodeId);
  if (!current) return map;
  const autoRevealTier = watchtowerLevel >= 2 ? 4 : watchtowerLevel >= 1 ? current.tier + 2 : current.tier + 1;
  const nextIds = new Set(current.connectedNodeIds);
  return map.map((node) => ({
    ...node,
    revealed: node.revealed || nextIds.has(node.id) || node.tier <= autoRevealTier,
  }));
};

const drawCards = (hand: string[], drawPile: string[], discardPile: string[], count: number) => {
  const nextHand = [...hand];
  let nextDraw = [...drawPile];
  let nextDiscard = [...discardPile];

  for (let i = 0; i < count; i += 1) {
    if (nextDraw.length === 0) {
      nextDraw = rotate(nextDiscard, 2);
      nextDiscard = [];
    }
    const drawn = nextDraw.shift();
    if (drawn) nextHand.push(drawn);
  }

  return { hand: nextHand, drawPile: nextDraw, discardPile: nextDiscard };
};

const pickCardRewards = (buildingLevels: Record<BuildingId, number>) => {
  const pool = getRewardPool(buildingLevels);
  return pool.slice(0, 3).map((card) => card.id);
};

const getRewardPool = (buildingLevels: Record<BuildingId, number>) => {
  const unlocked = Object.values(cards).filter((card) => {
    if (['strike', 'guard'].includes(card.id)) return false;
    if (!card.unlock) return true;
    return buildingLevels[card.unlock.building] >= card.unlock.level;
  });

  const offset = buildingLevels.forge + buildingLevels.herbalHut * 2 + buildingLevels.watchtower;
  return rotate(unlocked, offset);
};

const findNode = (run: RunState, nodeId: string) => run.map.find((node) => node.id === nodeId);

const rotate = <T,>(items: T[], offset: number): T[] => {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
};
