/** Reward / combat narrative copy not tied to a specific map node definition. */
export const narrative = {
  runDefeat: {
    title: 'The road takes its due',
    message: 'The Warden returns broken, carrying only what could be dragged from the ash.',
  },
  combatVictory: {
    defaultMessage: 'The road quiets. Choose what the Warden carries forward.',
    /** Shown when the defeated node is the boss (in addition to title using enemy name). */
    bossMessage: 'The Ash Knight falls. A blueprint plate is pried from the blackened armor.',
  },
} as const;
