export type ResourceId = 'wood' | 'iron' | 'herbs' | 'food' | 'relicShards' | 'blueprintScraps';
export type BuildingId = 'forge' | 'herbalHut' | 'watchtower';
export type HeroId = 'warden' | 'ember';

export type RelicPassiveId = 'firstTurnEnergy' | 'longPoison' | 'turnStartBlock';

export interface RelicDefinition {
  id: string;
  name: string;
  description: string;
  passive: RelicPassiveId;
  metaUnlockEmbers?: number;
}
export type CardType = 'attack' | 'defense' | 'utility' | 'status';
export type PuzzleCardRole = 'counter' | 'setup' | 'finisher' | 'stabilizer';
export type PuzzleObjectiveType = 'counterBlock' | 'counterPierce' | 'counterPoison' | 'sequenceSetupFinisher';
export type NodeType = 'start' | 'combat' | 'elite' | 'event' | 'camp' | 'boss';
export type View = 'village' | 'map' | 'combat' | 'reward';
export type CombatPulseType =
  | 'damage'
  | 'block'
  | 'heal'
  | 'poison'
  | 'draw'
  | 'enemyAttack'
  | 'enemyBlock'
  | 'enemyPoison'
  | 'telegraph'
  | 'victory';

export type Resources = Record<ResourceId, number>;

export type CardEffect =
  | { type: 'damage'; amount: number; siphonIfPoisoned?: number; pierce?: boolean }
  | { type: 'block'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'poison'; amount: number }
  | { type: 'draw'; amount: number }
  /** Next player damage this combat turn deals +amount (consumed on one damage instance). */
  | { type: 'applyExposed'; amount: number }
  /** Next player damage ignores enemy block once, then consumed. */
  | { type: 'markBrittle' };

export interface CardDefinition {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  description: string;
  effects: CardEffect[];
  puzzleRoles?: PuzzleCardRole[];
  /** When true, played cards go to exhausted pile instead of discard. */
  exhaust?: boolean;
  unlock?: {
    building: BuildingId;
    level: number;
  };
  metaUnlockEmbers?: number;
}

export interface EnemyIntent {
  label: string;
  damage?: number;
  block?: number;
  poison?: number;
  /** Adds to telegraph charge; no direct damage this step. */
  telegraphCharge?: number;
  /** Add flat damage from accumulated telegraph charge, then clear charge. */
  damageUsesCharge?: boolean;
  puzzleObjective?: PuzzleObjectiveType;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  role: string;
  puzzleHint?: string;
  intents: EnemyIntent[];
  rewards: Partial<Resources>;
}

export interface CombatPuzzleObjective {
  type: PuzzleObjectiveType;
  hint: string;
  success: boolean;
  failed: boolean;
  progress: {
    blockGainedThisTurn?: number;
    usedPierceThisTurn?: boolean;
    appliedPoisonThisTurn?: boolean;
    playedSetupThisTurn?: boolean;
    playedFinisherAfterSetupThisTurn?: boolean;
  };
  missPenalty?: {
    hpLoss?: number;
    enemyBlockGain?: number;
    enemyChargeGain?: number;
    playerPoisonGain?: number;
  };
  lastResolution?: 'success' | 'failed';
}

export interface BuildingLevelEffect {
  label: string;
  description: string;
}

export interface BuildingDefinition {
  id: BuildingId;
  name: string;
  description: string;
  maxLevel: number;
  upgradeCosts: Partial<Record<number, Partial<Resources>>>;
  levelEffects: Partial<Record<number, BuildingLevelEffect>>;
}

export interface MapNode {
  id: string;
  type: NodeType;
  label: string;
  enemyId?: string;
  eventId?: string;
  tier: number;
  revealed: boolean;
  resolved: boolean;
  connectedNodeIds: string[];
}

export interface VillageState {
  resources: Resources;
  buildingLevels: Record<BuildingId, number>;
  villagers: string[];
  unlockedHeroes: HeroId[];
}

export interface CombatState {
  enemyId: string;
  enemyHp: number;
  enemyBlock: number;
  enemyPoison: number;
  enemyIntentIndex: number;
  /** Damage stacked by telegraph intents; consumed when an intent uses damageUsesCharge. */
  enemyChargeStacks: number;
  /** Bonus damage on the next player damage effect this turn. */
  enemyExposedBonus: number;
  /** When true, the next player damage ignores enemy block entirely for that hit. */
  nextDamageIgnoresBlock: boolean;
  /** Increments after each enemy turn; 0 = opening player turn. */
  playerTurnCount: number;
  playerBlock: number;
  playerPoison: number;
  energy: number;
  hand: string[];
  /** Stable React keys per hand slot (same length as `hand`). */
  handSlotIds: string[];
  drawPile: string[];
  discardPile: string[];
  exhausted: string[];
  puzzleObjective?: CombatPuzzleObjective;
  log: string[];
}

export interface RewardState {
  sourceNodeId: string;
  title: string;
  message: string;
  cardOptions: string[];
  /** Elite relic draft; pick one or skip. */
  relicOptions?: string[];
  resources: Partial<Resources>;
  villager?: string;
  nextView: View;
}

export interface RunState {
  hero: HeroId;
  maxHp: number;
  hp: number;
  deck: string[];
  relics: string[];
  /** Seeded map/enemy variety for this run. */
  runSeed: number;
  map: MapNode[];
  currentNodeId: string;
  completedNodeIds: string[];
  pendingRewards: Partial<Resources>;
  pendingVillagers: string[];
  recentCardPicks: string[];
  bonusCardDraftCount: number;
  campBonusHeal: number;
  combat?: CombatState;
  reward?: RewardState;
}

export interface MetaState {
  embers: number;
  totalRuns: number;
  runsWon: number;
  highestEmbersEarnedInRun: number;
}

export interface GameState {
  view: View;
  village: VillageState;
  meta: MetaState;
  currentRun?: RunState;
  ui: {
    sequence: number;
    lastAction?: string;
    lastUpgrade?: BuildingId;
    changedResources?: ResourceId[];
    selectedNodeId?: string;
    chosenCardId?: string;
    chosenRelicId?: string;
    combatPulse?: {
      type: CombatPulseType;
      cardId?: string;
      target: 'player' | 'enemy' | 'hand' | 'reward';
    };
  };
  savedAt: number;
}
