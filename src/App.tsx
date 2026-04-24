import { useEffect, useReducer } from 'react';
import type { Dispatch as ReactDispatch } from 'react';
import {
  ArrowRight,
  Castle,
  Flame,
  HeartPulse,
  Map,
  Pickaxe,
  RotateCcw,
  Shield,
  Skull,
  Swords,
  Tent,
} from 'lucide-react';
import { buildings, cards, enemies, resourceLabels } from './gameData';
import { canAfford, gameReducer, loadGame, saveGame } from './gameLogic';
import type { BuildingId, CardDefinition, GameState, MapNode, ResourceId } from './types';

const resourceOrder: ResourceId[] = ['wood', 'iron', 'herbs', 'food', 'relicShards', 'blueprintScraps'];
const buildingOrder: BuildingId[] = ['forge', 'herbalHut', 'watchtower'];

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadGame);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <Flame size={20} aria-hidden="true" />
          <div>
            <p>Ashen World</p>
            <span>Playable village run prototype</span>
          </div>
        </div>

        <ResourceBar state={state} />

        <button className="icon-button" type="button" title="Reset saved game" onClick={() => dispatch({ type: 'reset' })}>
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </header>

      {state.view === 'village' ? <VillageView state={state} dispatch={dispatch} /> : null}
      {state.view === 'map' && state.currentRun ? <RunMapView state={state} dispatch={dispatch} /> : null}
      {state.view === 'combat' && state.currentRun?.combat ? <CombatView state={state} dispatch={dispatch} /> : null}
      {state.view === 'reward' && state.currentRun?.reward ? <RewardView state={state} dispatch={dispatch} /> : null}
    </main>
  );
}

function ResourceBar({ state }: { state: GameState }) {
  const run = state.currentRun;
  return (
    <section className="resource-bar" aria-label="Resources">
      {resourceOrder.map((resourceId) => (
        <div className="resource-pill" key={resourceId}>
          <span>{resourceLabels[resourceId]}</span>
          <strong>{state.village.resources[resourceId]}</strong>
        </div>
      ))}
      {run ? (
        <div className="resource-pill run-hp">
          <span>Warden HP</span>
          <strong>
            {run.hp}/{run.maxHp}
          </strong>
        </div>
      ) : null}
    </section>
  );
}

function VillageView({ state, dispatch }: ViewProps) {
  const villagers = state.village.villagers.length ? state.village.villagers.join(', ') : 'No rescued villagers yet';
  const forgeLevel = state.village.buildingLevels.forge;
  const herbalLevel = state.village.buildingLevels.herbalHut;
  const watchtowerLevel = state.village.buildingLevels.watchtower;

  return (
    <section className="screen village-screen">
      <div className="screen-heading">
        <div>
          <span className="eyebrow">Village</span>
          <h1>The last hearth before the ashen road</h1>
        </div>
        <button className="primary-action" type="button" onClick={() => dispatch({ type: 'startRun' })}>
          Start run
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="village-grid">
        <section className="panel village-summary">
          <Castle size={28} aria-hidden="true" />
          <h2>Warden Prep</h2>
          <dl>
            <div>
              <dt>Hero</dt>
              <dd>Warden</dd>
            </div>
            <div>
              <dt>Starting deck</dt>
              <dd>{forgeLevel >= 1 ? 'Tempered weapon kit' : 'Basic strike and guard kit'}</dd>
            </div>
            <div>
              <dt>Field aid</dt>
              <dd>{herbalLevel >= 1 ? 'Herbal Poultice packed' : 'None'}</dd>
            </div>
            <div>
              <dt>Map vision</dt>
              <dd>{watchtowerLevel >= 2 ? 'Full route revealed' : watchtowerLevel >= 1 ? 'Two tiers revealed' : 'Next branch only'}</dd>
            </div>
          </dl>
        </section>

        <section className="building-list" aria-label="Buildings">
          {buildingOrder.map((buildingId) => (
            <BuildingCard key={buildingId} buildingId={buildingId} state={state} dispatch={dispatch} />
          ))}
        </section>

        <section className="panel roster-panel">
          <h2>Rescued Villagers</h2>
          <p>{villagers}</p>
          <div className="quiet-note">
            Scouts and other survivors are content unlocks, not passive multipliers. Rescue one during a run to bring the map layer online.
          </div>
        </section>
      </div>
    </section>
  );
}

function BuildingCard({ buildingId, state, dispatch }: ViewProps & { buildingId: BuildingId }) {
  const building = buildings[buildingId];
  const level = state.village.buildingLevels[buildingId];
  const nextLevel = level + 1;
  const maxed = level >= building.maxLevel;
  const cost = building.upgradeCosts[nextLevel] ?? {};
  const affordable = !maxed && canAfford(state.village.resources, cost);
  const currentEffect = level > 0 ? building.levelEffects[level] : undefined;
  const nextEffect = !maxed ? building.levelEffects[nextLevel] : undefined;

  return (
    <article className="panel building-card">
      <div className="card-title-row">
        <div>
          <h2>{building.name}</h2>
          <span>Level {level}</span>
        </div>
        <Pickaxe size={22} aria-hidden="true" />
      </div>
      <p>{building.description}</p>
      <div className="effect-box">
        <strong>{currentEffect ? currentEffect.label : 'Unbuilt'}</strong>
        <span>{currentEffect ? currentEffect.description : 'Upgrade to connect this building to future runs.'}</span>
      </div>
      <div className="upgrade-row">
        <div>
          <span className="cost-label">{maxed ? 'Fully upgraded' : 'Upgrade cost'}</span>
          <CostLine cost={cost} />
          {nextEffect ? <small>{nextEffect.description}</small> : null}
        </div>
        <button
          className="secondary-action"
          type="button"
          disabled={!affordable}
          onClick={() => dispatch({ type: 'upgradeBuilding', buildingId })}
        >
          Upgrade
        </button>
      </div>
    </article>
  );
}

function RunMapView({ state, dispatch }: ViewProps) {
  const run = state.currentRun!;
  const currentNode = run.map.find((node) => node.id === run.currentNodeId)!;

  return (
    <section className="screen">
      <div className="screen-heading compact">
        <div>
          <span className="eyebrow">Run Map</span>
          <h1>The Ashen Road</h1>
        </div>
        <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'returnToVillage' })}>
          Retreat
        </button>
      </div>

      <div className="map-layout">
        <section className="panel current-node">
          <Map size={28} aria-hidden="true" />
          <h2>{currentNode.label}</h2>
          <p>{currentNode.type === 'start' ? 'The gate is behind you. Pick the first risk.' : 'Choose a connected revealed node.'}</p>
          <PendingRunRewards state={state} />
        </section>

        <section className="node-grid" aria-label="Route nodes">
          {run.map.map((node) => (
            <MapNodeButton key={node.id} node={node} currentNode={currentNode} dispatch={dispatch} />
          ))}
        </section>
      </div>
    </section>
  );
}

function MapNodeButton({ node, currentNode, dispatch }: { node: MapNode; currentNode: MapNode; dispatch: Dispatch }) {
  const reachable = currentNode.connectedNodeIds.includes(node.id);
  const disabled = !node.revealed || node.resolved || !reachable;
  const Icon = node.type === 'camp' ? Tent : node.type === 'boss' || node.type === 'elite' ? Skull : node.type === 'event' ? Flame : Swords;
  return (
    <button
      className={`map-node tier-${node.tier} ${node.resolved ? 'resolved' : ''} ${reachable ? 'reachable' : ''}`}
      type="button"
      disabled={disabled}
      onClick={() => dispatch({ type: 'selectNode', nodeId: node.id })}
    >
      <Icon size={20} aria-hidden="true" />
      <strong>{node.revealed ? node.label : 'Unscouted road'}</strong>
      <span>{node.revealed ? node.type : 'hidden'}</span>
    </button>
  );
}

function CombatView({ state, dispatch }: ViewProps) {
  const run = state.currentRun!;
  const combat = run.combat!;
  const enemy = enemies[combat.enemyId];
  const intent = enemy.intents[combat.enemyIntentIndex % enemy.intents.length];

  return (
    <section className="screen combat-screen">
      <div className="combat-grid">
        <section className="panel fighter-panel">
          <h2>Warden</h2>
          <div className="stat-line">
            <HeartPulse size={18} aria-hidden="true" />
            <span>
              {run.hp}/{run.maxHp} HP
            </span>
          </div>
          <div className="stat-line">
            <Shield size={18} aria-hidden="true" />
            <span>{combat.playerBlock} block</span>
          </div>
          <div className="energy-meter">
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={index} className={index < combat.energy ? 'filled' : ''} />
            ))}
          </div>
          <button className="secondary-action full" type="button" onClick={() => dispatch({ type: 'endTurn' })}>
            End turn
          </button>
        </section>

        <section className="panel enemy-panel">
          <span className="eyebrow">{enemy.role}</span>
          <h1>{enemy.name}</h1>
          <div className="enemy-stats">
            <span>{combat.enemyHp} HP</span>
            <span>{combat.enemyBlock} block</span>
            <span>{combat.enemyPoison} poison</span>
          </div>
          <div className="intent-box">
            <strong>Intent</strong>
            <span>{intent.label}</span>
          </div>
        </section>

        <section className="panel combat-log">
          <h2>Combat Log</h2>
          {combat.log.map((entry, index) => (
            <p key={`${entry}-${index}`}>{entry}</p>
          ))}
        </section>
      </div>

      <section className="hand-row" aria-label="Hand">
        {combat.hand.map((cardId, index) => (
          <CardButton key={`${cardId}-${index}`} card={cards[cardId]} disabled={cards[cardId].cost > combat.energy} onClick={() => dispatch({ type: 'playCard', handIndex: index })} />
        ))}
      </section>
    </section>
  );
}

function CardButton({ card, disabled, onClick }: { card: CardDefinition; disabled?: boolean; onClick?: () => void }) {
  return (
    <button className={`card-button ${card.type}`} type="button" disabled={disabled} onClick={onClick}>
      <div className="card-cost">{card.cost}</div>
      <strong>{card.name}</strong>
      <span>{card.type}</span>
      <p>{card.description}</p>
    </button>
  );
}

function RewardView({ state, dispatch }: ViewProps) {
  const run = state.currentRun!;
  const reward = run.reward!;

  return (
    <section className="screen reward-screen">
      <div className="reward-panel">
        <span className="eyebrow">Reward</span>
        <h1>{reward.title}</h1>
        <p>{reward.message}</p>

        <div className="reward-columns">
          <section>
            <h2>Gained</h2>
            <CostLine cost={reward.resources} />
            {reward.villager ? <p className="villager-chip">Villager rescued: {reward.villager}</p> : null}
          </section>

          {reward.cardOptions.length ? (
            <section>
              <h2>Choose a card</h2>
              <div className="reward-cards">
                {reward.cardOptions.map((cardId) => (
                  <CardButton key={cardId} card={cards[cardId]} onClick={() => dispatch({ type: 'chooseCardReward', cardId })} />
                ))}
              </div>
              <button className="text-action" type="button" onClick={() => dispatch({ type: 'skipCardReward' })}>
                Skip card reward
              </button>
            </section>
          ) : (
            <section>
              <h2>Run deck</h2>
              <p>{run.deck.length} cards carried.</p>
            </section>
          )}
        </div>

        <button className="primary-action" type="button" onClick={() => dispatch({ type: 'continueFromReward' })}>
          {reward.nextView === 'village' ? 'Return to village' : 'Continue'}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function PendingRunRewards({ state }: { state: GameState }) {
  const run = state.currentRun!;
  const gains = resourceOrder.filter((resourceId) => (run.pendingRewards[resourceId] ?? 0) > 0);
  return (
    <div className="pending-rewards">
      <strong>Carried home if you survive</strong>
      <span>{gains.length ? gains.map((resourceId) => `${resourceLabels[resourceId]} ${run.pendingRewards[resourceId]}`).join(' · ') : 'Nothing yet'}</span>
    </div>
  );
}

function CostLine({ cost }: { cost: Partial<Record<ResourceId, number>> }) {
  const entries = resourceOrder.filter((resourceId) => (cost[resourceId] ?? 0) > 0);
  if (!entries.length) return <span className="cost-line">None</span>;
  return (
    <span className="cost-line">
      {entries.map((resourceId) => (
        <span key={resourceId}>
          {resourceLabels[resourceId]} {cost[resourceId]}
        </span>
      ))}
    </span>
  );
}

type Dispatch = ReactDispatch<Parameters<typeof gameReducer>[1]>;
type ViewProps = {
  state: GameState;
  dispatch: Dispatch;
};
