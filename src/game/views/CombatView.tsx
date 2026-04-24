import { AnimatePresence, motion } from 'framer-motion';
import { HeartPulse, Shield } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { combatBalance } from '../../content/run';
import { cards, enemies } from '../../gameData';
import { CardButton } from '../CardButton';
import {
  enemyBlockStatPulse,
  enemyHpStatPulse,
  enemyPoisonStatPulse,
  logLineEnter,
  logLineExit,
  playerHpStatPulse,
  playerShieldStatPulse,
} from '../combatMotionPresets';
import { getCombatPanelAnimation } from '../getCombatPanelAnimation';
import { MotionScreen } from '../MotionScreen';
import { fastFade, staggerList } from '../uiConstants';
import type { ViewProps } from '../viewProps';

const heroDisplayName: Record<string, string> = {
  warden: 'Warden',
  ember: 'Ember',
};

const maxEnergySlots = (combat: { playerTurnCount: number }, run: { hero: string; relics: string[] }): number => {
  if (combat.playerTurnCount > 0) return combatBalance.turnEnergy;
  let bonus = 0;
  if (run.hero === 'ember') bonus += 1;
  if (run.relics.includes('ashCoin')) bonus += 1;
  return combatBalance.turnEnergy + bonus;
};

const CombatView = ({ state, dispatch, reduceMotion }: ViewProps) => {
  const run = state.currentRun!;
  const combat = run.combat!;
  const enemy = enemies[combat.enemyId];
  const intent = enemy.intents[combat.enemyIntentIndex % enemy.intents.length];
  const nextIntent = enemy.intents[(combat.enemyIntentIndex + 1) % enemy.intents.length];
  const energySlots = maxEnergySlots(combat, run);

  const tiltBySlotRef = useRef(new Map<string, number>());
  useEffect(() => {
    const alive = new Set(combat.handSlotIds);
    for (const id of tiltBySlotRef.current.keys()) {
      if (!alive.has(id)) tiltBySlotRef.current.delete(id);
    }
  }, [combat.handSlotIds]);

  const tiltForHandSlot = (slotId: string, index: number, handLen: number): number => {
    const map = tiltBySlotRef.current;
    if (!map.has(slotId)) {
      map.set(slotId, (index - (handLen - 1) / 2) * 2.2);
    }
    return map.get(slotId)!;
  };

  const pulse = state.ui.combatPulse;
  const playerPulse = pulse?.target === 'player' ? pulse.type : undefined;
  const enemyPulse = pulse?.target === 'enemy' ? pulse.type : undefined;

  return (
    <MotionScreen className='screen combat-screen' reduceMotion={reduceMotion}>
      <div className='combat-grid'>
        <motion.section
          className={`panel fighter-panel pulse-${playerPulse ?? 'none'}`}
          initial={reduceMotion ? false : { opacity: 0, x: -42 }}
          animate={getCombatPanelAnimation(playerPulse, 'player', reduceMotion)}
          transition={fastFade}
        >
          <h2>{heroDisplayName[run.hero] ?? run.hero}</h2>
          <motion.div
            className='stat-line'
            animate={playerPulse === 'enemyAttack' && !reduceMotion ? playerHpStatPulse : undefined}
            transition={{ duration: 0.28 }}
          >
            <HeartPulse size={18} aria-hidden='true' />
            <span>
              {run.hp}/{run.maxHp} HP
            </span>
          </motion.div>
          <motion.div
            className='stat-line'
            animate={
              (playerPulse === 'block' || playerPulse === 'enemyAttack') && !reduceMotion
                ? playerShieldStatPulse
                : undefined
            }
            transition={{ duration: 0.32 }}
          >
            <Shield size={18} aria-hidden='true' />
            <span>{combat.playerBlock} block</span>
          </motion.div>
          <div className='energy-meter' aria-label={`Energy ${combat.energy} of ${energySlots}`}>
            {Array.from({ length: energySlots }).map((_, index) => (
              <span key={index} className={index < combat.energy ? 'filled' : ''} />
            ))}
          </div>
          <motion.button
            className='secondary-action full'
            type='button'
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => dispatch({ type: 'endTurn' })}
          >
            End turn
          </motion.button>
        </motion.section>

        <motion.section
          className={`panel enemy-panel pulse-${enemyPulse ?? 'none'}`}
          initial={reduceMotion ? false : { opacity: 0, x: 52, scale: 0.97 }}
          animate={getCombatPanelAnimation(enemyPulse, 'enemy', reduceMotion)}
          transition={fastFade}
        >
          <span className='eyebrow'>{enemy.role}</span>
          <h1>{enemy.name}</h1>
          <div className='enemy-stats'>
            <motion.span animate={enemyPulse === 'damage' && !reduceMotion ? enemyHpStatPulse : undefined}>
              {combat.enemyHp} HP
            </motion.span>
            <motion.span animate={enemyPulse === 'enemyBlock' && !reduceMotion ? enemyBlockStatPulse : undefined}>
              {combat.enemyBlock} block
            </motion.span>
            <motion.span
              animate={
                (enemyPulse === 'poison' || enemyPulse === 'enemyPoison') && !reduceMotion
                  ? enemyPoisonStatPulse
                  : undefined
              }
            >
              {combat.enemyPoison} poison
            </motion.span>
          </div>
          <div className='intent-box'>
            <strong>Intent</strong>
            <span>{intent.label}</span>
            <strong className='intent-next-label'>Next</strong>
            <span className='intent-next'>{nextIntent.label}</span>
          </div>
        </motion.section>

        <motion.section
          className='panel combat-log'
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fastFade}
        >
          <h2>Combat Log</h2>
          <AnimatePresence initial={false}>
            {combat.log.map((entry, index) => (
              <motion.p
                key={`log-${combat.log.length - 1 - index}`}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={logLineEnter}
                exit={logLineExit}
                transition={{ duration: 0.2 }}
              >
                {entry}
              </motion.p>
            ))}
          </AnimatePresence>
        </motion.section>
      </div>

      <motion.section
        className='hand-row'
        aria-label='Hand'
        initial={reduceMotion ? false : 'enter'}
        animate='center'
        variants={staggerList}
      >
        <AnimatePresence initial={false} mode='popLayout'>
          {combat.hand.map((cardId, index) => (
            <CardButton
              key={combat.handSlotIds[index]}
              variant='combat'
              dealStaggerIndex={index}
              card={cards[cardId]}
              disabled={cards[cardId].cost > combat.energy}
              reduceMotion={reduceMotion}
              rewardTilt={tiltForHandSlot(combat.handSlotIds[index], index, combat.hand.length)}
              onClick={() => dispatch({ type: 'playCard', handIndex: index })}
            />
          ))}
        </AnimatePresence>
      </motion.section>
    </MotionScreen>
  );
};

export default CombatView;
