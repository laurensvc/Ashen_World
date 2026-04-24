import { useEffect, useReducer } from 'react';
import type { Dispatch as ReactDispatch, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Transition } from 'framer-motion';
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
import type { BuildingId, CardDefinition, CombatPulseType, GameState, MapNode, ResourceId } from './types';

const resourceOrder: ResourceId[] = ['wood', 'iron', 'herbs', 'food', 'relicShards', 'blueprintScraps'];
const buildingOrder: BuildingId[] = ['forge', 'herbalHut', 'watchtower'];
const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];
const easeOutQuint: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fastFade: Transition = { duration: 0.24, ease: easeOutQuart };
const springyImpact: Transition = { type: 'spring', stiffness: 520, damping: 26, mass: 0.8 };
const screenVariants = {
  enter: { opacity: 0, x: 34, filter: 'blur(6px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -28, filter: 'blur(4px)' },
};
const staggerList = {
  center: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};
const riseItem = {
  enter: { opacity: 0, y: 18, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1 },
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadGame);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return (
    <main className="app-shell">
      <motion.header className="topbar" initial={reduceMotion ? false : 'enter'} animate="center" variants={staggerList}>
        <motion.div className="brand-mark" variants={riseItem} transition={fastFade}>
          <Flame size={20} aria-hidden="true" />
          <div>
            <p>Ashen World</p>
            <span>Playable village run prototype</span>
          </div>
        </motion.div>

        <ResourceBar state={state} reduceMotion={reduceMotion} />

        <motion.button className="icon-button" type="button" title="Reset saved game" variants={riseItem} whileTap={reduceMotion ? undefined : { scale: 0.92 }} onClick={() => dispatch({ type: 'reset' })}>
          <RotateCcw size={18} aria-hidden="true" />
        </motion.button>
      </motion.header>

      <AnimatePresence mode="wait">
        {state.view === 'village' ? (
          <VillageView key="village" state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
        ) : null}
        {state.view === 'map' && state.currentRun ? (
          <RunMapView key={`map-${state.currentRun.currentNodeId}`} state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
        ) : null}
        {state.view === 'combat' && state.currentRun?.combat ? (
          <CombatView key={`combat-${state.currentRun.currentNodeId}`} state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
        ) : null}
        {state.view === 'reward' && state.currentRun?.reward ? (
          <RewardView key={`reward-${state.currentRun.reward.sourceNodeId}-${state.ui.sequence}`} state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function ResourceBar({ state, reduceMotion }: { state: GameState; reduceMotion: boolean | null }) {
  const run = state.currentRun;
  return (
    <motion.section className="resource-bar" aria-label="Resources" variants={riseItem} transition={fastFade}>
      {resourceOrder.map((resourceId) => (
        <motion.div
          className={`resource-pill ${state.ui.changedResources?.includes(resourceId) ? 'resource-changed' : ''}`}
          key={resourceId}
          animate={reduceMotion || !state.ui.changedResources?.includes(resourceId) ? undefined : { scale: [1, 1.16, 1], y: [0, -4, 0] }}
          transition={{ duration: 0.48, ease: easeOutQuint }}
        >
          <span>{resourceLabels[resourceId]}</span>
          <strong>{state.village.resources[resourceId]}</strong>
        </motion.div>
      ))}
      {run ? (
        <motion.div className="resource-pill run-hp" animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 0.32 }}>
          <span>Warden HP</span>
          <strong>
            {run.hp}/{run.maxHp}
          </strong>
        </motion.div>
      ) : null}
    </motion.section>
  );
}

function VillageView({ state, dispatch, reduceMotion }: ViewProps) {
  const villagers = state.village.villagers.length ? state.village.villagers.join(', ') : 'No rescued villagers yet';
  const forgeLevel = state.village.buildingLevels.forge;
  const herbalLevel = state.village.buildingLevels.herbalHut;
  const watchtowerLevel = state.village.buildingLevels.watchtower;

  return (
    <MotionScreen className="screen village-screen" reduceMotion={reduceMotion}>
      <div className="screen-heading">
        <div>
          <span className="eyebrow">Village</span>
          <h1>The last hearth before the ashen road</h1>
        </div>
        <motion.button className="primary-action" type="button" whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={() => dispatch({ type: 'startRun' })}>
          Start run
          <ArrowRight size={18} aria-hidden="true" />
        </motion.button>
      </div>

      <motion.div className="village-grid" initial={reduceMotion ? false : 'enter'} animate="center" variants={staggerList}>
        <motion.section className="panel village-summary" variants={riseItem} transition={fastFade}>
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
        </motion.section>

        <section className="building-list" aria-label="Buildings">
          {buildingOrder.map((buildingId) => (
            <BuildingCard key={buildingId} buildingId={buildingId} state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
          ))}
        </section>

        <motion.section className="panel roster-panel" variants={riseItem} transition={fastFade}>
          <h2>Rescued Villagers</h2>
          <p>{villagers}</p>
          <div className="quiet-note">
            Scouts and other survivors are content unlocks, not passive multipliers. Rescue one during a run to bring the map layer online.
          </div>
        </motion.section>
      </motion.div>
    </MotionScreen>
  );
}

function BuildingCard({ buildingId, state, dispatch, reduceMotion }: ViewProps & { buildingId: BuildingId }) {
  const building = buildings[buildingId];
  const level = state.village.buildingLevels[buildingId];
  const nextLevel = level + 1;
  const maxed = level >= building.maxLevel;
  const cost = building.upgradeCosts[nextLevel] ?? {};
  const affordable = !maxed && canAfford(state.village.resources, cost);
  const currentEffect = level > 0 ? building.levelEffects[level] : undefined;
  const nextEffect = !maxed ? building.levelEffects[nextLevel] : undefined;
  const upgraded = state.ui.lastUpgrade === buildingId && state.ui.lastAction === 'upgrade';

  return (
    <motion.article
      className={`panel building-card ${upgraded ? 'is-upgraded' : ''}`}
      variants={riseItem}
      transition={upgraded && !reduceMotion ? springyImpact : fastFade}
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.012 }}
      animate={
        upgraded && !reduceMotion
          ? {
              scale: [1, 1.035, 1],
              boxShadow: ['0 18px 45px rgba(0, 0, 0, 0.22)', '0 22px 70px rgba(224, 154, 84, 0.36)', '0 18px 45px rgba(0, 0, 0, 0.22)'],
            }
          : undefined
      }
    >
      <div className="card-title-row">
        <div>
          <h2>{building.name}</h2>
          <motion.span animate={upgraded && !reduceMotion ? { scale: [1, 1.5, 1], color: ['#c99457', '#ffe0a8', '#c99457'] } : undefined} transition={{ duration: 0.52 }}>
            Level {level}
          </motion.span>
        </div>
        <motion.div animate={upgraded && !reduceMotion ? { rotate: [0, -24, 18, 0], scale: [1, 1.2, 1] } : undefined} transition={{ duration: 0.56 }}>
          <Pickaxe size={22} aria-hidden="true" />
        </motion.div>
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
        <motion.button
          className="secondary-action"
          type="button"
          disabled={!affordable}
          whileHover={reduceMotion || !affordable ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion || !affordable ? undefined : { scale: 0.92 }}
          onClick={() => dispatch({ type: 'upgradeBuilding', buildingId })}
        >
          Upgrade
        </motion.button>
      </div>
    </motion.article>
  );
}

function RunMapView({ state, dispatch, reduceMotion }: ViewProps) {
  const run = state.currentRun!;
  const currentNode = run.map.find((node) => node.id === run.currentNodeId)!;

  return (
    <MotionScreen className="screen" reduceMotion={reduceMotion}>
      <div className="screen-heading compact">
        <div>
          <span className="eyebrow">Run Map</span>
          <h1>The Ashen Road</h1>
        </div>
        <motion.button className="secondary-action" type="button" whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={() => dispatch({ type: 'returnToVillage' })}>
          Retreat
        </motion.button>
      </div>

      <div className="map-layout">
        <motion.section className="panel current-node" initial={reduceMotion ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={fastFade}>
          <Map size={28} aria-hidden="true" />
          <h2>{currentNode.label}</h2>
          <p>{currentNode.type === 'start' ? 'The gate is behind you. Pick the first risk.' : 'Choose a connected revealed node.'}</p>
          <PendingRunRewards state={state} />
        </motion.section>

        <motion.section className="node-grid" aria-label="Route nodes" initial={reduceMotion ? false : 'enter'} animate="center" variants={staggerList}>
          {run.map.map((node) => (
            <MapNodeButton key={node.id} node={node} currentNode={currentNode} dispatch={dispatch} reduceMotion={reduceMotion} selected={state.ui.selectedNodeId === node.id} />
          ))}
        </motion.section>
      </div>
    </MotionScreen>
  );
}

function MapNodeButton({ node, currentNode, dispatch, reduceMotion, selected }: { node: MapNode; currentNode: MapNode; dispatch: Dispatch; reduceMotion: boolean | null; selected: boolean }) {
  const reachable = currentNode.connectedNodeIds.includes(node.id);
  const disabled = !node.revealed || node.resolved || !reachable;
  const Icon = node.type === 'camp' ? Tent : node.type === 'boss' || node.type === 'elite' ? Skull : node.type === 'event' ? Flame : Swords;
  return (
    <motion.button
      className={`map-node tier-${node.tier} ${node.resolved ? 'resolved' : ''} ${reachable ? 'reachable' : ''}`}
      type="button"
      disabled={disabled}
      variants={riseItem}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 16 }}
      animate={
        reduceMotion
          ? undefined
          : selected
            ? { opacity: 1, scale: [1, 1.12, 0.96], y: [0, -8, 0] }
            : reachable && !disabled
              ? { opacity: 1, scale: [1, 1.025, 1], y: 0 }
              : { opacity: node.revealed ? 1 : 0.52, scale: 1, y: 0 }
      }
      whileHover={reduceMotion || disabled ? undefined : { y: -5, scale: 1.03 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.92 }}
      transition={reachable && !disabled ? { repeat: reduceMotion ? 0 : Infinity, repeatDelay: 1.4, duration: 0.9, ease: easeOutQuint } : fastFade}
      onClick={() => dispatch({ type: 'selectNode', nodeId: node.id })}
    >
      <Icon size={20} aria-hidden="true" />
      <strong>{node.revealed ? node.label : 'Unscouted road'}</strong>
      <span>{node.revealed ? node.type : 'hidden'}</span>
    </motion.button>
  );
}

function CombatView({ state, dispatch, reduceMotion }: ViewProps) {
  const run = state.currentRun!;
  const combat = run.combat!;
  const enemy = enemies[combat.enemyId];
  const intent = enemy.intents[combat.enemyIntentIndex % enemy.intents.length];

  const pulse = state.ui.combatPulse;
  const playerPulse = pulse?.target === 'player' ? pulse.type : undefined;
  const enemyPulse = pulse?.target === 'enemy' ? pulse.type : undefined;

  return (
    <MotionScreen className="screen combat-screen" reduceMotion={reduceMotion}>
      <div className="combat-grid">
        <motion.section
          className={`panel fighter-panel pulse-${playerPulse ?? 'none'}`}
          initial={reduceMotion ? false : { opacity: 0, x: -42 }}
          animate={getCombatPanelAnimation(playerPulse, 'player', reduceMotion)}
          transition={springyImpact}
        >
          <h2>Warden</h2>
          <motion.div className="stat-line" animate={playerPulse === 'enemyAttack' && !reduceMotion ? { scale: [1, 1.18, 1] } : undefined} transition={{ duration: 0.28 }}>
            <HeartPulse size={18} aria-hidden="true" />
            <span>
              {run.hp}/{run.maxHp} HP
            </span>
          </motion.div>
          <motion.div className="stat-line" animate={(playerPulse === 'block' || playerPulse === 'enemyAttack') && !reduceMotion ? { scale: [1, 1.18, 1] } : undefined} transition={{ duration: 0.32 }}>
            <Shield size={18} aria-hidden="true" />
            <span>{combat.playerBlock} block</span>
          </motion.div>
          <div className="energy-meter">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.span key={index} className={index < combat.energy ? 'filled' : ''} animate={index < combat.energy && !reduceMotion ? { scale: [1, 1.16, 1] } : undefined} transition={{ duration: 0.42, delay: index * 0.04 }} />
            ))}
          </div>
          <motion.button className="secondary-action full" type="button" whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={() => dispatch({ type: 'endTurn' })}>
            End turn
          </motion.button>
        </motion.section>

        <motion.section
          className={`panel enemy-panel pulse-${enemyPulse ?? 'none'}`}
          initial={reduceMotion ? false : { opacity: 0, x: 52, scale: 0.97 }}
          animate={getCombatPanelAnimation(enemyPulse, 'enemy', reduceMotion)}
          transition={springyImpact}
        >
          <span className="eyebrow">{enemy.role}</span>
          <h1>{enemy.name}</h1>
          <div className="enemy-stats">
            <motion.span animate={enemyPulse === 'damage' && !reduceMotion ? { scale: [1, 1.24, 1] } : undefined}>{combat.enemyHp} HP</motion.span>
            <motion.span animate={enemyPulse === 'enemyBlock' && !reduceMotion ? { scale: [1, 1.22, 1] } : undefined}>{combat.enemyBlock} block</motion.span>
            <motion.span animate={(enemyPulse === 'poison' || enemyPulse === 'enemyPoison') && !reduceMotion ? { scale: [1, 1.25, 1] } : undefined}>{combat.enemyPoison} poison</motion.span>
          </div>
          <motion.div className="intent-box" animate={!reduceMotion ? { scale: [1, 1.03, 1] } : undefined} transition={{ duration: 0.38, delay: 0.08 }}>
            <strong>Intent</strong>
            <span>{intent.label}</span>
          </motion.div>
        </motion.section>

        <motion.section className="panel combat-log" initial={reduceMotion ? false : { opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={fastFade}>
          <h2>Combat Log</h2>
          <AnimatePresence initial={false}>
            {combat.log.map((entry, index) => (
              <motion.p key={`${entry}-${index}`} initial={reduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {entry}
              </motion.p>
            ))}
          </AnimatePresence>
        </motion.section>
      </div>

      <motion.section className="hand-row" aria-label="Hand" initial={reduceMotion ? false : 'enter'} animate="center" variants={staggerList}>
        <AnimatePresence initial={false}>
          {combat.hand.map((cardId, index) => (
            <CardButton
              key={`${cardId}-${index}-${combat.enemyIntentIndex}`}
              card={cards[cardId]}
              disabled={cards[cardId].cost > combat.energy}
              reduceMotion={reduceMotion}
              selected={state.ui.combatPulse?.cardId === cardId}
              onClick={() => dispatch({ type: 'playCard', handIndex: index })}
            />
          ))}
        </AnimatePresence>
      </motion.section>
    </MotionScreen>
  );
}

function CardButton({ card, disabled, selected, rewardTilt = 0, reduceMotion, onClick }: { card: CardDefinition; disabled?: boolean; selected?: boolean; rewardTilt?: number; reduceMotion?: boolean | null; onClick?: () => void }) {
  return (
    <motion.button
      className={`card-button ${card.type}`}
      type="button"
      disabled={disabled}
      variants={riseItem}
      initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: rewardTilt, scale: 0.94 }}
      animate={
        selected && !reduceMotion
          ? { opacity: 1, y: [-8, -34, 0], rotate: [rewardTilt, rewardTilt * 0.4, 0], scale: [1, 1.14, 1] }
          : { opacity: 1, y: 0, rotate: rewardTilt, scale: 1 }
      }
      exit={reduceMotion ? undefined : { opacity: 0, y: -34, rotate: rewardTilt * -1, scale: 0.88 }}
      whileHover={reduceMotion || disabled ? undefined : { y: -8, rotate: rewardTilt * 0.35, scale: 1.035 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.9, y: -2 }}
      transition={springyImpact}
      onClick={onClick}
    >
      <div className="card-cost">{card.cost}</div>
      <strong>{card.name}</strong>
      <span>{card.type}</span>
      <p>{card.description}</p>
    </motion.button>
  );
}

function RewardView({ state, dispatch, reduceMotion }: ViewProps) {
  const run = state.currentRun!;
  const reward = run.reward!;

  return (
    <MotionScreen className="screen reward-screen" reduceMotion={reduceMotion}>
      <motion.div className="reward-panel" initial={reduceMotion ? false : { opacity: 0, y: 38, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -24, scale: 0.96 }} transition={springyImpact}>
          <motion.span className="eyebrow" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>Reward</motion.span>
        <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...fastFade, delay: 0.1 }}>{reward.title}</motion.h1>
        <motion.p initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...fastFade, delay: 0.16 }}>{reward.message}</motion.p>

        <div className="reward-columns">
          <section>
            <h2>Gained</h2>
            <CostLine cost={reward.resources} animated reduceMotion={reduceMotion} />
            {reward.villager ? (
              <motion.p className="villager-chip" initial={reduceMotion ? false : { opacity: 0, scale: 0.76 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springyImpact, delay: 0.18 }}>
                Villager rescued: {reward.villager}
              </motion.p>
            ) : null}
          </section>

          {reward.cardOptions.length ? (
            <section>
              <h2>Choose a card</h2>
              <div className="reward-cards">
                {reward.cardOptions.map((cardId, index) => (
                  <CardButton key={cardId} card={cards[cardId]} selected={state.ui.chosenCardId === cardId} rewardTilt={(index - 1) * 3} reduceMotion={reduceMotion} onClick={() => dispatch({ type: 'chooseCardReward', cardId })} />
                ))}
              </div>
              <motion.button className="text-action" type="button" whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={() => dispatch({ type: 'skipCardReward' })}>
                Skip card reward
              </motion.button>
            </section>
          ) : (
            <section>
              <h2>Run deck</h2>
              <p>{run.deck.length} cards carried.</p>
            </section>
          )}
        </div>

        <motion.button className="primary-action" type="button" whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={() => dispatch({ type: 'continueFromReward' })}>
          {reward.nextView === 'village' ? 'Return to village' : 'Continue'}
          <ArrowRight size={18} aria-hidden="true" />
        </motion.button>
      </motion.div>
    </MotionScreen>
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

function CostLine({ cost, animated, reduceMotion }: { cost: Partial<Record<ResourceId, number>>; animated?: boolean; reduceMotion?: boolean | null }) {
  const entries = resourceOrder.filter((resourceId) => (cost[resourceId] ?? 0) > 0);
  if (!entries.length) return <span className="cost-line">None</span>;
  return (
    <span className="cost-line">
      {entries.map((resourceId, index) => (
        <motion.span
          key={resourceId}
          initial={animated && !reduceMotion ? { opacity: 0, scale: 0.62, y: 8 } : false}
          animate={animated && !reduceMotion ? { opacity: 1, scale: [0.62, 1.18, 1], y: 0 } : undefined}
          transition={{ duration: 0.42, delay: index * 0.08, ease: easeOutQuint }}
        >
          {resourceLabels[resourceId]} {cost[resourceId]}
        </motion.span>
      ))}
    </span>
  );
}

function MotionScreen({ className, reduceMotion, children }: { className: string; reduceMotion?: boolean | null; children: ReactNode }) {
  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : 'enter'}
      animate="center"
      exit={reduceMotion ? undefined : 'exit'}
      variants={screenVariants}
      transition={fastFade}
    >
      {children}
    </motion.section>
  );
}

function getCombatPanelAnimation(pulse: CombatPulseType | undefined, side: 'player' | 'enemy', reduceMotion: boolean | null) {
  if (reduceMotion) return { opacity: 1, x: 0, scale: 1 };
  if (pulse === 'damage') return { opacity: 1, x: [0, side === 'enemy' ? 18 : -18, side === 'enemy' ? -10 : 10, 0], scale: [1, 1.035, 1] };
  if (pulse === 'enemyAttack') return { opacity: 1, x: [0, side === 'player' ? -18 : 18, side === 'player' ? 10 : -10, 0], scale: [1, 1.03, 1] };
  if (pulse === 'block' || pulse === 'enemyBlock') return { opacity: 1, x: 0, scale: [1, 1.045, 1] };
  if (pulse === 'poison' || pulse === 'enemyPoison') return { opacity: 1, x: [0, -5, 5, 0], scale: [1, 1.025, 1] };
  if (pulse === 'victory') return { opacity: [1, 0.82, 1], x: [0, 26, -14, 0], scale: [1, 0.96, 1] };
  return { opacity: 1, x: 0, scale: 1 };
}

type Dispatch = ReactDispatch<Parameters<typeof gameReducer>[1]>;
type ViewProps = {
  state: GameState;
  dispatch: Dispatch;
  reduceMotion: boolean | null;
};
