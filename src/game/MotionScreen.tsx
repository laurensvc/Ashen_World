import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { fastFade, screenVariants } from './uiConstants';

type MotionScreenProps = {
  className: string;
  reduceMotion?: boolean | null;
  children: ReactNode;
  style?: CSSProperties;
};

export const MotionScreen = ({ className, reduceMotion, children, style }: MotionScreenProps) => (
  <motion.section
    className={className}
    style={style}
    initial={reduceMotion ? false : 'enter'}
    animate='center'
    exit={reduceMotion ? undefined : 'exit'}
    variants={screenVariants}
    transition={fastFade}
  >
    {children}
  </motion.section>
);
