export type ResourceId = 'wood' | 'iron' | 'herbs' | 'food' | 'relicShards' | 'blueprintScraps';
export type BuildingId = 'forge' | 'herbalHut' | 'watchtower';
export type HeroId = 'warden';
export type CardType = 'attack' | 'defense' | 'utility' | 'status';
export type NodeType = 'start' | 'combat' | 'elite' | 'event' | 'camp' | 'boss';
export type View = 'village' | 'map' | 'combat' | 'reward';

export type Resources = Record<ResourceId, number>;

export type CardEffect =
  | { type: 'damage'; amount: number }
  | { type: 'block'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'poison'; amount: number }
  | { type: 'draw'; amount: number };

export interface CardDefinition {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  description: string;
  effects: CardEffect[];
  unlock?: {
    building: BuildingId;
    level: number;
  };
}

export interface EnemyIntent {
  label: string;
  damage?: number;
  block?: number;
  poison?: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  role: string;
  intents: EnemyIntent[];
  rewards: Partial<Resources>;
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
  playerBlock: number;
  playerPoison: number;
  energy: number;
  hand: string[];
  drawPile: string[];
  discardPile: string[];
  exhausted: string[];
  log: string[];
}

export interface RewardState {
  sourceNodeId: string;
  title: string;
  message: string;
  cardOptions: string[];
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
  map: MapNode[];
  currentNodeId: string;
  completedNodeIds: string[];
  pendingRewards: Partial<Resources>;
  pendingVillagers: string[];
  combat?: CombatState;
  reward?: RewardState;
}

export interface GameState {
  view: View;
  village: VillageState;
  currentRun?: RunState;
  savedAt: number;
}
