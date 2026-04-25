import { cards } from './cards';
import { eventsById } from './events';
import { relics } from './relics';
import type { View } from '../types';

const files = import.meta.glob('../assets/generated/*.png', { eager: true, import: 'default' }) as Record<
  string,
  string
>;

const toAssetPath = (name: string): string | undefined => files[`../assets/generated/${name}`];

const fallbackCard = toAssetPath('card-strike.png');
const fallbackEvent = toAssetPath('event-scout.png');
const fallbackRelic = toAssetPath('relic-ashCoin.png');
const fallbackUi = toAssetPath('ui-village.png');

const cardArtById: Record<string, string> = {};
for (const cardId of Object.keys(cards)) {
  const url = toAssetPath(`card-${cardId}.png`);
  if (url) cardArtById[cardId] = url;
}

const eventArtById: Record<string, string> = {};
for (const eventId of Object.keys(eventsById)) {
  const url = toAssetPath(`event-${eventId}.png`);
  if (url) eventArtById[eventId] = url;
}

const relicArtById: Record<string, string> = {};
for (const relicId of Object.keys(relics)) {
  const url = toAssetPath(`relic-${relicId}.png`);
  if (url) relicArtById[relicId] = url;
}

const uiBackgroundByView: Partial<Record<View, string>> = {
  village: toAssetPath('ui-village.png'),
  map: toAssetPath('ui-map.png'),
  combat: toAssetPath('ui-combat.png'),
  reward: toAssetPath('ui-reward.png'),
};

export const getCardArtUrl = (cardId: string): string | undefined => cardArtById[cardId] ?? fallbackCard;
export const getEventArtUrl = (eventId?: string): string | undefined =>
  eventId ? (eventArtById[eventId] ?? fallbackEvent) : fallbackEvent;
export const getRelicArtUrl = (relicId: string): string | undefined => relicArtById[relicId] ?? fallbackRelic;
export const getUiBackgroundUrl = (view: View): string | undefined => uiBackgroundByView[view] ?? fallbackUi;

export const generatedAssetManifest = {
  cards: cardArtById,
  events: eventArtById,
  relics: relicArtById,
  ui: uiBackgroundByView,
} as const;
