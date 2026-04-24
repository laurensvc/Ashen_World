import { motion } from 'framer-motion';
import { Pickaxe } from 'lucide-react';
import { buildings } from '../../gameData';
import { canAfford } from '../../gameLogic';
import type { BuildingId } from '../../types';
import { CostLine } from '../CostLine';
import { fastFade, riseItem, springyImpact } from '../uiConstants';
import type { ViewProps } from '../viewProps';

type BuildingCardProps = ViewProps & { buildingId: BuildingId };

const BUILDING_UPGRADE_CARD = {
  scale: [1, 1.035, 1],
  boxShadow: [
    '0 18px 45px rgba(0, 0, 0, 0.22)',
    '0 22px 70px rgba(224, 154, 84, 0.36)',
    '0 18px 45px rgba(0, 0, 0, 0.22)',
  ],
};
const BUILDING_LEVEL_LABEL_PULSE = { scale: [1, 1.5, 1], color: ['#c99457', '#ffe0a8', '#c99457'] };
const BUILDING_PICKAXE_PULSE = { rotate: [0, -24, 18, 0], scale: [1, 1.2, 1] };

export const BuildingCard = ({ buildingId, state, dispatch, reduceMotion }: BuildingCardProps) => {
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
      animate={upgraded && !reduceMotion ? BUILDING_UPGRADE_CARD : undefined}
    >
      <div className='card-title-row'>
        <div>
          <h2>{building.name}</h2>
          <motion.span
            animate={upgraded && !reduceMotion ? BUILDING_LEVEL_LABEL_PULSE : undefined}
            transition={{ duration: 0.52 }}
          >
            Level {level}
          </motion.span>
        </div>
        <motion.div
          animate={upgraded && !reduceMotion ? BUILDING_PICKAXE_PULSE : undefined}
          transition={{ duration: 0.56 }}
        >
          <Pickaxe size={22} aria-hidden='true' />
        </motion.div>
      </div>
      <p>{building.description}</p>
      <div className='effect-box'>
        <strong>{currentEffect ? currentEffect.label : 'Unbuilt'}</strong>
        <span>{currentEffect ? currentEffect.description : 'Upgrade to connect this building to future runs.'}</span>
      </div>
      <div className='upgrade-row'>
        <div>
          <span className='cost-label'>{maxed ? 'Fully upgraded' : 'Upgrade cost'}</span>
          <CostLine cost={cost} />
          {nextEffect ? <small>{nextEffect.description}</small> : null}
        </div>
        <motion.button
          className='secondary-action'
          type='button'
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
};
