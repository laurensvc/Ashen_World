import { motion } from 'framer-motion';
import { resourceLabels } from '../gameData';
import type { GameState } from '../types';
import { easeOutQuint, fastFade, resourceOrder, riseItem } from './uiConstants';

const RESOURCE_CHANGED_PULSE = { scale: [1, 1.16, 1], y: [0, -4, 0] };

type ResourceBarProps = {
  state: GameState;
  reduceMotion: boolean | null;
};

export const ResourceBar = ({ state, reduceMotion }: ResourceBarProps) => {
  const run = state.currentRun;
  return (
    <motion.section className='resource-bar' aria-label='Resources' variants={riseItem} transition={fastFade}>
      {resourceOrder.map((resourceId) => (
        <motion.div
          className={`resource-pill ${state.ui.changedResources?.includes(resourceId) ? 'resource-changed' : ''}`}
          key={resourceId}
          animate={
            reduceMotion || !state.ui.changedResources?.includes(resourceId) ? undefined : RESOURCE_CHANGED_PULSE
          }
          transition={{ duration: 0.48, ease: easeOutQuint }}
        >
          <span>{resourceLabels[resourceId]}</span>
          <strong>{state.village.resources[resourceId]}</strong>
        </motion.div>
      ))}
      {run ? (
        <div className='resource-pill run-hp'>
          <span>{run.hero === 'ember' ? 'Ember HP' : 'Warden HP'}</span>
          <strong>
            {run.hp}/{run.maxHp}
          </strong>
        </div>
      ) : null}
    </motion.section>
  );
};
