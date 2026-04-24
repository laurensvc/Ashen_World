import { motion } from 'framer-motion';
import { ArrowRight, Castle } from 'lucide-react';
import { MotionScreen } from '../MotionScreen';
import { buildingOrder, fastFade, riseItem, staggerList } from '../uiConstants';
import type { ViewProps } from '../viewProps';
import { BuildingCard } from './BuildingCard';

const VillageView = ({ state, dispatch, reduceMotion }: ViewProps) => {
  const villagers = state.village.villagers.length ? state.village.villagers.join(', ') : 'No rescued villagers yet';
  const forgeLevel = state.village.buildingLevels.forge;
  const herbalLevel = state.village.buildingLevels.herbalHut;
  const watchtowerLevel = state.village.buildingLevels.watchtower;

  return (
    <MotionScreen className='screen village-screen' reduceMotion={reduceMotion}>
      <div className='screen-heading'>
        <div>
          <span className='eyebrow'>Village</span>
          <h1>The last hearth before the ashen road</h1>
        </div>
        <motion.button
          className='primary-action'
          type='button'
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => dispatch({ type: 'startRun' })}
        >
          Start run
          <ArrowRight size={18} aria-hidden='true' />
        </motion.button>
      </div>

      <motion.div
        className='village-grid'
        initial={reduceMotion ? false : 'enter'}
        animate='center'
        variants={staggerList}
      >
        <motion.section className='panel village-summary' variants={riseItem} transition={fastFade}>
          <Castle size={28} aria-hidden='true' />
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
              <dd>
                {watchtowerLevel >= 2
                  ? 'Full route revealed'
                  : watchtowerLevel >= 1
                    ? 'Two tiers revealed'
                    : 'Next branch only'}
              </dd>
            </div>
          </dl>
        </motion.section>

        <section className='building-list' aria-label='Buildings'>
          {buildingOrder.map((buildingId) => (
            <BuildingCard
              key={buildingId}
              buildingId={buildingId}
              state={state}
              dispatch={dispatch}
              reduceMotion={reduceMotion}
            />
          ))}
        </section>

        <motion.section className='panel roster-panel' variants={riseItem} transition={fastFade}>
          <h2>Rescued Villagers</h2>
          <p>{villagers}</p>
          <div className='quiet-note'>
            Scouts and other survivors are content unlocks, not passive multipliers. Rescue one during a run to bring
            the map layer online.
          </div>
        </motion.section>
      </motion.div>
    </MotionScreen>
  );
};

export default VillageView;
