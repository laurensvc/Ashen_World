import { motion } from 'framer-motion';
import { Flame, Skull, Swords, Tent } from 'lucide-react';
import type { MapNode } from '../../types';
import { easeOutQuint, fastFade, riseItem } from '../uiConstants';
import type { GameDispatch } from '../viewProps';

const MAP_NODE_SELECTED = { opacity: 1, scale: [1, 1.12, 0.96], y: [0, -8, 0] };
const MAP_NODEREACHABLE_IDLE = { opacity: 1, scale: [1, 1.025, 1], y: 0 };
const MAP_NODE_DIM = { opacity: 0.52, scale: 1, y: 0 };
const MAP_NODE_REVEALED = { opacity: 1, scale: 1, y: 0 };

type MapNodeButtonProps = {
  node: MapNode;
  currentNode: MapNode;
  dispatch: GameDispatch;
  reduceMotion: boolean | null;
  selected: boolean;
};

export const MapNodeButton = ({ node, currentNode, dispatch, reduceMotion, selected }: MapNodeButtonProps) => {
  const reachable = currentNode.connectedNodeIds.includes(node.id);
  const disabled = !node.revealed || node.resolved || !reachable;
  const Icon =
    node.type === 'camp'
      ? Tent
      : node.type === 'boss' || node.type === 'elite'
        ? Skull
        : node.type === 'event'
          ? Flame
          : Swords;
  return (
    <motion.button
      className={`map-node tier-${node.tier} ${node.resolved ? 'resolved' : ''} ${reachable ? 'reachable' : ''}`}
      type='button'
      disabled={disabled}
      variants={riseItem}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 16 }}
      animate={
        reduceMotion
          ? undefined
          : selected
            ? MAP_NODE_SELECTED
            : reachable && !disabled
              ? MAP_NODEREACHABLE_IDLE
              : node.revealed
                ? MAP_NODE_REVEALED
                : MAP_NODE_DIM
      }
      whileHover={reduceMotion || disabled ? undefined : { y: -5, scale: 1.03 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.92 }}
      transition={
        reachable && !disabled
          ? { repeat: reduceMotion ? 0 : Infinity, repeatDelay: 1.4, duration: 0.9, ease: easeOutQuint }
          : fastFade
      }
      onClick={() => dispatch({ type: 'selectNode', nodeId: node.id })}
    >
      <Icon size={20} aria-hidden='true' />
      <strong>{node.revealed ? node.label : 'Unscouted road'}</strong>
      <span>{node.revealed ? node.type : 'hidden'}</span>
    </motion.button>
  );
};
