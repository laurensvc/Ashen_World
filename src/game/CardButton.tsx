import { motion } from 'framer-motion';
import type { CardDefinition } from '../types';
import { cardDealSpring, cardPlayExit, riseItem, springyImpact } from './uiConstants';

type CardButtonProps = {
  card: CardDefinition;
  disabled?: boolean;
  /** Reward picker: highlights the chosen card. Do not use for combat (pulse/cardId is ambiguous for duplicates). */
  selected?: boolean;
  /** `combat`: deal-from-deck entrance + play-to-discard exit. `reward`: tilted fan reveal. */
  variant?: 'combat' | 'reward';
  /** Staggers combat deal / draw when multiple cards enter together. */
  dealStaggerIndex?: number;
  rewardTilt?: number;
  reduceMotion?: boolean | null;
  onClick?: () => void;
};

export const CardButton = ({
  card,
  disabled,
  selected,
  variant = 'reward',
  dealStaggerIndex = 0,
  rewardTilt = 0,
  reduceMotion,
  onClick,
}: CardButtonProps) => {
  const isCombat = variant === 'combat';
  const staggerDelay = isCombat && !reduceMotion ? Math.min(dealStaggerIndex, 12) * 0.055 : 0;

  const combatInitial = { opacity: 0, y: 76, rotate: rewardTilt + 7, scale: 0.88 };
  const combatAnimate = { opacity: 1, y: 0, rotate: rewardTilt, scale: 1 };
  const combatExit = { opacity: 0, y: -52, rotate: rewardTilt - 11, scale: 0.78 };

  return (
    <motion.button
      className={`card-button ${card.type}`}
      type='button'
      disabled={disabled}
      style={isCombat ? { transformOrigin: '50% 92%' } : undefined}
      variants={isCombat ? undefined : riseItem}
      initial={reduceMotion ? false : isCombat ? combatInitial : { opacity: 0, y: 28, rotate: rewardTilt, scale: 0.94 }}
      animate={
        selected && !reduceMotion && !isCombat
          ? { opacity: 1, y: [-8, -34, 0], rotate: [rewardTilt, rewardTilt * 0.4, 0], scale: [1, 1.14, 1] }
          : isCombat
            ? combatAnimate
            : { opacity: 1, y: 0, rotate: rewardTilt, scale: 1 }
      }
      exit={
        reduceMotion
          ? undefined
          : isCombat
            ? { ...combatExit, transition: cardPlayExit }
            : { opacity: 0, y: -34, rotate: rewardTilt * -1, scale: 0.88, transition: cardPlayExit }
      }
      whileHover={reduceMotion || disabled ? undefined : { y: -8, rotate: rewardTilt * 0.35, scale: 1.035 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.92, y: -3 }}
      transition={isCombat ? { ...cardDealSpring, delay: staggerDelay } : springyImpact}
      onClick={onClick}
    >
      <div className='card-cost'>{card.cost}</div>
      <strong>{card.name}</strong>
      <span>{card.type}</span>
      <p>{card.description}</p>
    </motion.button>
  );
};
