import { buildingDisplayOrder, buildings } from './buildings';
import { cards } from './cards';
import { generatedAssetManifest } from './artAssets';
import { enemies } from './enemies';
import { eventsById } from './events';
import { createRunMap } from './map';
import { relicDisplayOrder, relics } from './relics';
import {
  buildStartingDeck,
  deckAddMutations,
  deckReplaceMutations,
  heroProfiles,
  starterDeckBase,
  starterVillage,
} from './run';

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(`[content/integrity] ${message}`);
};

/** Validates cross-references between content shards. Call in dev on startup. */
export const assertContentIntegrity = (): void => {
  for (const id of Object.keys(cards)) {
    assert(cards[id].id === id, `cards key "${id}" must match card.id "${cards[id].id}"`);
  }

  for (const cardId of starterDeckBase) {
    assert(Boolean(cards[cardId]), `starterDeckBase references unknown card "${cardId}"`);
  }

  for (const mut of deckReplaceMutations) {
    assert(
      Boolean(cards[mut.replace.fromCardId]),
      `deckReplaceMutations unknown fromCardId "${mut.replace.fromCardId}"`,
    );
    assert(Boolean(cards[mut.replace.toCardId]), `deckReplaceMutations unknown toCardId "${mut.replace.toCardId}"`);
  }

  for (const mut of deckAddMutations) {
    for (const id of mut.addCardIds) {
      assert(Boolean(cards[id]), `deckAddMutations unknown card "${id}"`);
    }
  }

  for (const heroId of Object.keys(heroProfiles) as (keyof typeof heroProfiles)[]) {
    const sampleDeck = buildStartingDeck(heroId, { forge: 2, herbalHut: 2, watchtower: 2 });
    for (const id of sampleDeck) {
      assert(Boolean(cards[id]), `buildStartingDeck(${heroId}) produced unknown card "${id}"`);
    }
  }

  for (const bid of buildingDisplayOrder) {
    assert(Boolean(buildings[bid]), `buildingDisplayOrder references unknown building "${bid}"`);
  }

  for (const eid of Object.keys(enemies)) {
    assert(enemies[eid].id === eid, `enemies key "${eid}" must match enemy.id`);
  }

  for (const rid of relicDisplayOrder) {
    assert(Boolean(relics[rid]), `relicDisplayOrder references unknown relic "${rid}"`);
    assert(relics[rid].id === rid, `relics key "${rid}" must match relic.id`);
  }

  for (const cid of Object.keys(cards)) {
    assert(Boolean(generatedAssetManifest.cards[cid]), `missing generated card art for "${cid}"`);
  }
  const cardAssetValues = Object.values(generatedAssetManifest.cards);
  assert(
    new Set(cardAssetValues).size === cardAssetValues.length,
    'generated card art must be one-to-one (no duplicated file mapping)',
  );
  for (const eid of Object.keys(eventsById)) {
    assert(Boolean(generatedAssetManifest.events[eid]), `missing generated event art for "${eid}"`);
  }
  for (const rid of relicDisplayOrder) {
    assert(Boolean(generatedAssetManifest.relics[rid]), `missing generated relic art for "${rid}"`);
  }
  for (const view of ['village', 'map', 'combat', 'reward'] as const) {
    assert(Boolean(generatedAssetManifest.ui[view]), `missing generated UI background for "${view}"`);
  }

  for (const mapParams of [
    [0, 0],
    [2, 42_069],
  ] as const) {
    const map0 = createRunMap(mapParams[0], mapParams[1]);
    for (const node of map0) {
      if (node.enemyId) {
        assert(Boolean(enemies[node.enemyId]), `map references unknown enemyId "${node.enemyId}" on node "${node.id}"`);
      }
      if (node.eventId) {
        assert(
          Boolean(eventsById[node.eventId]),
          `map references unknown eventId "${node.eventId}" on node "${node.id}"`,
        );
      }
    }
  }

  assert(
    starterVillage.unlockedHeroes.includes('warden'),
    'starterVillage.unlockedHeroes must include warden for current game',
  );
};
