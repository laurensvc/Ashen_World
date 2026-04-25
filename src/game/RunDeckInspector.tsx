import { cards } from '../gameData';

type RunDeckInspectorProps = {
  deck: string[];
  recentCardPicks?: string[];
  title?: string;
  compact?: boolean;
};

type TypeCount = {
  attack: number;
  defense: number;
  utility: number;
  status: number;
};

const emptyTypeCount = (): TypeCount => ({
  attack: 0,
  defense: 0,
  utility: 0,
  status: 0,
});

export const RunDeckInspector = ({ deck, recentCardPicks = [], title = 'Deck', compact }: RunDeckInspectorProps) => {
  const byType = deck.reduce((acc, cardId) => {
    const type = cards[cardId]?.type;
    if (type) acc[type] += 1;
    return acc;
  }, emptyTypeCount());
  const avgCost = deck.length
    ? (deck.reduce((sum, cardId) => sum + (cards[cardId]?.cost ?? 0), 0) / deck.length).toFixed(1)
    : '0.0';
  const grouped = deck.reduce<Record<string, number>>((acc, cardId) => {
    acc[cardId] = (acc[cardId] ?? 0) + 1;
    return acc;
  }, {});
  const rows = Object.entries(grouped).sort((a, b) => (cards[b[0]]?.cost ?? 0) - (cards[a[0]]?.cost ?? 0));
  const recentSet = new Set(recentCardPicks);

  return (
    <section className={`panel run-deck-inspector${compact ? ' compact' : ''}`}>
      <h2>{title}</h2>
      <div className='run-deck-inspector__stats'>
        <span>{deck.length} cards</span>
        <span>{avgCost} avg cost</span>
        <span>A {byType.attack}</span>
        <span>D {byType.defense}</span>
        <span>U {byType.utility}</span>
        <span>S {byType.status}</span>
      </div>
      <div className='run-deck-inspector__list'>
        {rows.map(([cardId, count]) => {
          const card = cards[cardId];
          if (!card) return null;
          return (
            <div className={`run-deck-inspector__row${recentSet.has(cardId) ? ' is-recent' : ''}`} key={cardId}>
              <span className='run-deck-inspector__name'>{card.name}</span>
              <span className='run-deck-inspector__meta'>
                {card.cost}e · {card.type}
              </span>
              <strong>x{count}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
};
