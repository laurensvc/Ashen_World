import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cards } from '../../gameData';
import { CardButton } from '../CardButton';
import { CostLine } from '../CostLine';
import { MotionScreen } from '../MotionScreen';
import { fastFade, springyImpact } from '../uiConstants';
import type { ViewProps } from '../viewProps';

const RewardView = ({ state, dispatch, reduceMotion }: ViewProps) => {
  const run = state.currentRun!;
  const reward = run.reward!;

  return (
    <MotionScreen className='screen reward-screen' reduceMotion={reduceMotion}>
      <motion.div
        className='reward-panel'
        initial={reduceMotion ? false : { opacity: 0, y: 38, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.96 }}
        transition={springyImpact}
      >
        <motion.span
          className='eyebrow'
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          Reward
        </motion.span>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fastFade, delay: 0.1 }}
        >
          {reward.title}
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fastFade, delay: 0.16 }}
        >
          {reward.message}
        </motion.p>

        <div className='reward-columns'>
          <section>
            <h2>Gained</h2>
            <CostLine cost={reward.resources} animated reduceMotion={reduceMotion} />
            {reward.villager ? (
              <motion.p
                className='villager-chip'
                initial={reduceMotion ? false : { opacity: 0, scale: 0.76 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springyImpact, delay: 0.18 }}
              >
                Villager rescued: {reward.villager}
              </motion.p>
            ) : null}
          </section>

          {reward.cardOptions.length ? (
            <section>
              <h2>Choose a card</h2>
              <div className='reward-cards'>
                {reward.cardOptions.map((cardId, index) => (
                  <CardButton
                    key={cardId}
                    card={cards[cardId]}
                    selected={state.ui.chosenCardId === cardId}
                    rewardTilt={(index - 1) * 3}
                    reduceMotion={reduceMotion}
                    onClick={() => dispatch({ type: 'chooseCardReward', cardId })}
                  />
                ))}
              </div>
              <motion.button
                className='text-action'
                type='button'
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                onClick={() => dispatch({ type: 'skipCardReward' })}
              >
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

        <motion.button
          className='primary-action'
          type='button'
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => dispatch({ type: 'continueFromReward' })}
        >
          {reward.nextView === 'village' ? 'Return to village' : 'Continue'}
          <ArrowRight size={18} aria-hidden='true' />
        </motion.button>
      </motion.div>
    </MotionScreen>
  );
};

export default RewardView;
