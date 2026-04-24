import { motion } from 'framer-motion';
import { resourceLabels } from '../gameData';
import type { ResourceId } from '../types';
import { easeOutQuint, resourceOrder } from './uiConstants';

const COST_LINE_SHOW = { opacity: 1, scale: [0.62, 1.18, 1], y: 0 };

type CostLineProps = {
  cost: Partial<Record<ResourceId, number>>;
  animated?: boolean;
  reduceMotion?: boolean | null;
};

export const CostLine = ({ cost, animated, reduceMotion }: CostLineProps) => {
  const entries = resourceOrder.filter((resourceId) => (cost[resourceId] ?? 0) > 0);
  if (!entries.length) return <span className='cost-line'>None</span>;
  return (
    <span className='cost-line'>
      {entries.map((resourceId, index) => (
        <motion.span
          key={resourceId}
          initial={animated && !reduceMotion ? { opacity: 0, scale: 0.62, y: 8 } : false}
          animate={animated && !reduceMotion ? COST_LINE_SHOW : undefined}
          transition={{ duration: 0.42, delay: index * 0.08, ease: easeOutQuint }}
        >
          {resourceLabels[resourceId]} {cost[resourceId]}
        </motion.span>
      ))}
    </span>
  );
};
