import { motion } from 'framer-motion';
import { ArrowRight, Castle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { heroProfiles } from '../../content/run';
import { getMetaTierLabel } from '../../content/metaProgression';
import { getUiBackgroundUrl } from '../../gameData';
import { buildStartingDeck } from '../../content/run';
import type { HeroId } from '../../types';
import { MotionScreen } from '../MotionScreen';
import { RunDeckInspector } from '../RunDeckInspector';
import { buildingOrder, fastFade, riseItem, staggerList } from '../uiConstants';
import type { ViewProps } from '../viewProps';
import { BuildingCard } from './BuildingCard';

const heroLabel: Record<HeroId, string> = {
  warden: 'Warden',
  ember: 'Ember',
};

const VillageView = ({ state, dispatch, reduceMotion }: ViewProps) => {
  const unlocked = state.village.unlockedHeroes;
  const [selectedHero, setSelectedHero] = useState<HeroId>(() => unlocked[0] ?? 'warden');

  useEffect(() => {
    if (!unlocked.includes(selectedHero)) {
      setSelectedHero(unlocked[0] ?? 'warden');
    }
  }, [unlocked, selectedHero]);

  const heroToRun = unlocked.includes(selectedHero) ? selectedHero : (unlocked[0] ?? 'warden');
  const profile = heroProfiles[heroToRun];

  const villagers = state.village.villagers.length ? state.village.villagers.join(', ') : 'No rescued villagers yet';
  const forgeLevel = state.village.buildingLevels.forge;
  const herbalLevel = state.village.buildingLevels.herbalHut;
  const watchtowerLevel = state.village.buildingLevels.watchtower;

  const previewDeck = buildStartingDeck(heroToRun, state.village.buildingLevels, state.meta);

  return (
    <MotionScreen
      className='screen village-screen'
      reduceMotion={reduceMotion}
      style={
        getUiBackgroundUrl('village')
          ? ({ '--screen-bg': `url("${getUiBackgroundUrl('village')}")` } as CSSProperties)
          : undefined
      }
    >
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
          onClick={() => dispatch({ type: 'startRun', heroId: heroToRun })}
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
          <h2>Run prep</h2>
          <div className='hero-pick' role='group' aria-label='Choose hero'>
            {(['warden', 'ember'] as const).map((id) => {
              const on = unlocked.includes(id);
              return (
                <button
                  key={id}
                  type='button'
                  className={`hero-pick__btn${heroToRun === id ? ' hero-pick__btn--active' : ''}`}
                  disabled={!on}
                  onClick={() => on && setSelectedHero(id)}
                >
                  {heroLabel[id]}
                  {!on && id === 'ember' ? ' (Forge II)' : null}
                </button>
              );
            })}
          </div>
          <dl>
            <div>
              <dt>Hero</dt>
              <dd>{heroLabel[heroToRun]}</dd>
            </div>
            <div>
              <dt>HP</dt>
              <dd>{profile.maxHp}</dd>
            </div>
            <div>
              <dt>Starting deck</dt>
              <dd>{previewDeck.length} cards ready</dd>
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
          <div className='quiet-note'>
            Meta rank: {getMetaTierLabel(state.meta.embers)} · {state.meta.embers} embers
          </div>
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
          <p>
            Runs: {state.meta.totalRuns} · Wins: {state.meta.runsWon} · Best ember haul:{' '}
            {state.meta.highestEmbersEarnedInRun}
          </p>
          <div className='quiet-note'>
            Scouts and other survivors are content unlocks, not passive multipliers. Rescue one during a run to bring
            the map layer online.
          </div>
        </motion.section>
        <RunDeckInspector deck={previewDeck} title='Starting deck preview' compact />
      </motion.div>
    </MotionScreen>
  );
};

export default VillageView;
