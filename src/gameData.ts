/**
 * Game content facade: re-exports shards from `src/content/` for stable imports (`gameLogic`, UI).
 */
export { buildingDisplayOrder, buildings } from './content/buildings';
export { cards } from './content/cards';
export { enemies } from './content/enemies';
export { relicDisplayOrder, relics } from './content/relics';
export {
  generatedAssetManifest,
  getCardArtUrl,
  getEventArtUrl,
  getRelicArtUrl,
  getUiBackgroundUrl,
} from './content/artAssets';
export { assertContentIntegrity } from './content/integrity';
export { createRunMap } from './content/map';
export { resourceDisplayOrder, resourceLabels, emptyResources } from './content/resources';
export { createStarterState } from './content/run';
