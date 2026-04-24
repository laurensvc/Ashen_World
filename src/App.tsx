import { Suspense, lazy, useEffect, useReducer } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Flame, RotateCcw } from 'lucide-react';
import { ResourceBar } from './game/ResourceBar';
import { fastFade, riseItem, staggerList } from './game/uiConstants';
import { gameReducer, loadGame, saveGame } from './gameLogic';

const VillageView = lazy(() => import('./game/views/VillageView'));
const RunMapView = lazy(() => import('./game/views/RunMapView'));
const CombatView = lazy(() => import('./game/views/CombatView'));
const RewardView = lazy(() => import('./game/views/RewardView'));

const ViewSuspenseFallback = () => (
  <div className='app-suspense-fallback' role='status' aria-live='polite'>
    <span className='app-suspense-fallback__pulse' aria-hidden='true' />
    <span>Preparing view…</span>
  </div>
);

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadGame);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return (
    <main className='app-shell'>
      <motion.header
        className='topbar'
        initial={reduceMotion ? false : 'enter'}
        animate='center'
        variants={staggerList}
      >
        <motion.div className='brand-mark' variants={riseItem} transition={fastFade}>
          <Flame size={20} aria-hidden='true' />
          <div>
            <p>Ashen World</p>
            <span>Playable village run prototype</span>
          </div>
        </motion.div>

        <ResourceBar state={state} reduceMotion={reduceMotion} />

        <motion.button
          className='icon-button'
          type='button'
          title='Reset saved game'
          variants={riseItem}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          onClick={() => dispatch({ type: 'reset' })}
        >
          <RotateCcw size={18} aria-hidden='true' />
        </motion.button>
      </motion.header>

      <Suspense fallback={<ViewSuspenseFallback />}>
        <AnimatePresence mode='wait'>
          {state.view === 'village' ? (
            <VillageView key='village' state={state} dispatch={dispatch} reduceMotion={reduceMotion} />
          ) : null}
          {state.view === 'map' && state.currentRun ? (
            <RunMapView
              key={`map-${state.currentRun.currentNodeId}`}
              state={state}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
            />
          ) : null}
          {state.view === 'combat' && state.currentRun?.combat ? (
            <CombatView
              key={`combat-${state.currentRun.currentNodeId}`}
              state={state}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
            />
          ) : null}
          {state.view === 'reward' && state.currentRun?.reward ? (
            <RewardView
              key={`reward-${state.currentRun.reward.sourceNodeId}-${state.ui.sequence}`}
              state={state}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </Suspense>
    </main>
  );
}
