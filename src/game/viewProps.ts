import type { Dispatch as ReactDispatch } from 'react';
import type { GameAction } from '../gameLogic';
import type { GameState } from '../types';

export type GameDispatch = ReactDispatch<GameAction>;

export type ViewProps = {
  state: GameState;
  dispatch: GameDispatch;
  reduceMotion: boolean | null;
};
