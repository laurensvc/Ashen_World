import { buildingDisplayOrder } from '../content/buildings';
import { resourceDisplayOrder } from '../content/resources';
import type { BuildingId, ResourceId } from '../types';

export const resourceOrder: ResourceId[] = resourceDisplayOrder;
export const buildingOrder: BuildingId[] = buildingDisplayOrder;

export const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];
export const easeOutQuint: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Motion timing tokens (Framer Motion–compatible; kept untyped to avoid coupling this module to `framer-motion`.) */
export const fastFade = { duration: 0.24, ease: easeOutQuart };

export const springyImpact = { type: 'spring' as const, stiffness: 520, damping: 26, mass: 0.8 };

/** Combat cards: deal from deck / into hand. */
export const cardDealSpring = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.82 };

/** Short tween for card exit (play / discard). */
export const cardPlayExit = { duration: 0.28, ease: easeOutQuart };

export const screenVariants = {
  enter: { opacity: 0, x: 34, filter: 'blur(6px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -28, filter: 'blur(4px)' },
};

export const staggerList = {
  center: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

export const riseItem = {
  enter: { opacity: 0, y: 18, scale: 0.97 },
  center: { opacity: 1, y: 0, scale: 1 },
};
