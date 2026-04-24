import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fastFade, screenVariants } from './uiConstants';

type MotionScreenProps = {
  className: string;
  reduceMotion?: boolean | null;
  children: ReactNode;
};

export const MotionScreen = ({ className, reduceMotion, children }: MotionScreenProps) => (
  <motion.section
    className={className}
    initial={reduceMotion ? false : 'enter'}
    animate='center'
    exit={reduceMotion ? undefined : 'exit'}
    variants={screenVariants}
    transition={fastFade}
  >
    {children}
  </motion.section>
);
