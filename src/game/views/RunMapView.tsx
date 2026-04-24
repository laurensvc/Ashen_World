import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { resourceLabels } from '../../gameData';
import type { GameState } from '../../types';
import { MotionScreen } from '../MotionScreen';
import { fastFade, resourceOrder, staggerList } from '../uiConstants';
import type { ViewProps } from '../viewProps';
import { MapNodeButton } from './MapNodeButton';

const PendingRunRewards = ({ state }: { state: GameState }) => {
  const run = state.currentRun!;
  const gains = resourceOrder.filter((resourceId) => (run.pendingRewards[resourceId] ?? 0) > 0);
  return (
    <div className='pending-rewards'>
      <strong>Carried home if you survive</strong>
      <span>
        {gains.length
          ? gains.map((resourceId) => `${resourceLabels[resourceId]} ${run.pendingRewards[resourceId]}`).join(' · ')
          : 'Nothing yet'}
      </span>
    </div>
  );
};

const RunMapView = ({ state, dispatch, reduceMotion }: ViewProps) => {
  const run = state.currentRun!;
  const currentNode = run.map.find((node) => node.id === run.currentNodeId)!;

  return (
    <MotionScreen className='screen' reduceMotion={reduceMotion}>
      <div className='screen-heading compact'>
        <div>
          <span className='eyebrow'>Run Map</span>
          <h1>The Ashen Road</h1>
        </div>
        <motion.button
          className='secondary-action'
          type='button'
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => dispatch({ type: 'returnToVillage' })}
        >
          Retreat
        </motion.button>
      </div>

      <div className='map-layout'>
        <motion.section
          className='panel current-node'
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fastFade}
        >
          <Map size={28} aria-hidden='true' />
          <h2>{currentNode.label}</h2>
          <p>
            {currentNode.type === 'start'
              ? 'The gate is behind you. Pick the first risk.'
              : 'Choose a connected revealed node.'}
          </p>
          <PendingRunRewards state={state} />
        </motion.section>

        <motion.section
          className='node-grid'
          aria-label='Route nodes'
          initial={reduceMotion ? false : 'enter'}
          animate='center'
          variants={staggerList}
        >
          {run.map.map((node) => (
            <MapNodeButton
              key={node.id}
              node={node}
              currentNode={currentNode}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
              selected={state.ui.selectedNodeId === node.id}
            />
          ))}
        </motion.section>
      </div>
    </MotionScreen>
  );
};

export default RunMapView;
