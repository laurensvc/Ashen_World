# Browser Game MVP Design Document

## Working project names

- Ashen Village
- Hollow Hearth
- The Last Hamlet
- Cinder Settlement
- Blackroot Village
- Warden of the Hollow

For now, this document will refer to the game as **Ashen Village**.

---

# 1. High-level concept

## One-sentence pitch

A browser game where the player builds and upgrades a dark fantasy village, then sends heroes on roguelite runs to gather loot, villagers, relics, and blueprints that unlock new systems and stronger strategic options back home.

## Short pitch

The game combines three fantasies:

1. **Village growth over time** through light idle production and permanent upgrades.
2. **Strategic runs** with deckbuilding and route decisions.
3. **Long-term specialization** where the village changes what future runs are possible.

The key promise is that the village is **not** just a place that increases numbers. It changes starting loadouts, build archetypes, map control, crafting options, and long-term risk management.

## Core player fantasy

The player is rebuilding a small settlement in a ruined world. Every run into the wilderness is dangerous, but successful expeditions bring home the materials, people, and knowledge needed to turn a weak camp into a specialized, resilient village.

Over time, the player should feel:

- my village is growing
- my runs are becoming more interesting
- I can shape my own playstyle
- the world is still dangerous
- my build choices matter

---

# 2. Design pillars

## Pillar 1: Village progression must create new decisions

Village upgrades should mostly unlock:

- new starting loadouts
- new hero classes or companions
- new card pools
- new map manipulation tools
- new consumables or relic crafting
- new ways to answer enemy mechanics

Village upgrades should only rarely be simple stat increases.

## Pillar 2: Runs must remain tactically interesting

Runs should involve:

- route choice
- deck decisions
- combat tradeoffs
- resource scarcity
- risk versus reward
- adaptation to enemy mechanics

The village prepares the player. The run tests the player.

## Pillar 3: Power should expand breadth more than raw damage

The game should avoid fake progression such as:

- card deals 1 damage at start
- later the same card deals 10 damage
- enemies just have 10 times more HP

Instead, later power should come from:

- synergy
- combo setups
- map control
- support tools
- better drafting
- tailored counters
- richer build paths

## Pillar 4: The MVP must stay small and shippable

The first version should not try to be Slay the Spire, Factorio, Clash of Clans, and Elden Ring at the same time.

The MVP should focus on:

- one village screen
- one run map
- turn-based card combat
- a few buildings
- a few hero archetypes
- a few enemy factions
- one satisfying progression loop

## Pillar 5: Tone matters

The world should feel melancholic, ruined, and slightly mythic, but the mechanics should remain readable and practical.

Target mood:

- dark fantasy
- decayed world
- quiet danger
- old relics and lost crafts
- survivors rebuilding something meaningful

---

# 3. MVP goals

## What the MVP must prove

The MVP must prove that the following loop is fun:

**Run -> return with loot -> improve village -> next run meaningfully changes**

If that loop feels satisfying, more content can be added later.

## What the MVP does not need yet

The MVP does not need:

- real-time multiplayer
- advanced factory logistics
- a huge content pool
- dozens of classes
- a giant world map
- deep social systems
- animation-heavy combat
- full live PvP

## Success criteria for the MVP

The MVP is successful if a player can say:

- I understand the village quickly
- I want to do one more run
- village upgrades feel meaningful
- my run options change based on village choices
- different village paths create different run strategies

---

# 4. Core game loop

## Macro loop

1. The village passively produces a few basic resources.
2. The player chooses upgrades, crafts items, and prepares a hero.
3. The player starts a run.
4. During the run, the player fights enemies, collects loot, rescues villagers, and makes map choices.
5. The player returns to the village, alive or defeated.
6. The loot is processed into permanent progress.
7. New systems unlock, changing the next run.

## Micro loop inside the village

1. Collect passive resources.
2. Assign or benefit from villagers.
3. Choose one upgrade or craft action.
4. Pick a hero and starting loadout.
5. Start run.

## Micro loop inside a run

1. Choose next node.
2. Resolve combat or event.
3. Gain card, relic, consumable, or resource.
4. Decide how greedy or safe to play.
5. Reach boss or fail.

---

# 5. Game structure at a glance

## Main layers

### Layer A: Village
The permanent home base.

### Layer B: Run
A self-contained expedition through a branching map.

### Layer C: Meta progression
Unlocks, villagers, blueprints, new buildings, and higher-difficulty zones.

### Layer D: Light idle economy
A small amount of passive generation that supports the village fantasy without overshadowing runs.

---

# 6. Core player verbs

The player should spend most of the game doing these things:

- build
- choose
- prepare
- explore
- fight
- draft
- return
- specialize
- risk
- recover

These verbs are strong because they connect directly to both village play and run play.

---

# 7. The village system

## Overview

The village is the permanent layer. It should be readable at a glance and compact in the MVP. A good initial shape is a single screen with 5 major buildings and a few support elements.

## Recommended MVP village buildings

### 1. Forge
**Role:** gear, weapon cards, armor upgrades, basic combat tech

Unlocks and effects:

- improved starting weapon choices
- access to heavier attack cards
- basic armor and block cards
- weapon craftables before runs
- some relic enhancement recipes

Example progression:

- Level 1: unlock Iron Strike starter card choice
- Level 2: unlock shield craftables
- Level 3: unlock heavy weapon archetype

### 2. Herbal Hut
**Role:** healing, poison, regen, consumables

Unlocks and effects:

- healing herbs before a run
- poison cards in the reward pool
- antidotes or cleanse tools
- stronger campsite recovery options

Example progression:

- Level 1: start each run with 1 herb
- Level 2: poison cards can appear
- Level 3: brew one custom potion before each run

### 3. Shrine
**Role:** blessings, curse management, magic tools

Unlocks and effects:

- choose one blessing at run start
- remove one curse per run
- unlock spiritual or curse-based cards
- access to relic attunement

Example progression:

- Level 1: one simple blessing option
- Level 2: minor curse removal in village
- Level 3: unlock ritual-themed build path

### 4. Watchtower
**Role:** map scouting, route visibility, defense, control

Unlocks and effects:

- reveal nodes ahead on the run map
- reroll one map branch per run
- identify elite encounters early
- increase chance of safe events

Example progression:

- Level 1: reveal first branch
- Level 2: one map reroll per run
- Level 3: preview boss modifier before starting

### 5. Inn
**Role:** recruits, morale, rescued villagers, hero options

Unlocks and effects:

- rescued villagers join the settlement
- new hero archetypes become available
- morale bonuses
- companion system

Example progression:

- Level 1: rescued villagers can be housed
- Level 2: unlock second hero archetype
- Level 3: choose one companion before a run

## Support village elements

### Resource storage
Basic storage for wood, iron, herbs, relic shards, and food.

### Population panel
Tracks rescued villagers and what roles they unlock.

### Crafting queue
A small crafting area for pre-run consumables and simple gear.

### Village pressure meter
Optional in MVP, but useful later. Tracks corruption, morale, food shortage, or external threats.

---

# 8. Resources

## Permanent resources

### Wood
Used for construction and basic upgrades.

Sources:

- passive village production
- run rewards
- event nodes

### Iron
Used for forge upgrades and gear crafting.

Sources:

- run rewards
- elite fights
- mining-related events

### Herbs
Used for healing items and alchemy.

Sources:

- passive growth after Herbal Hut unlock
- run nodes
- event rewards

### Food
Used to support villagers, companions, or pre-run prep.

Sources:

- passive village production
- event rewards

### Relic Shards
Rare progression material used for shrine upgrades, relic systems, and long-term unlocks.

Sources:

- bosses
- elite encounters
- rare events

### Blueprint Scraps
Used to unlock new building tiers or advanced content.

Sources:

- bosses
- special exploration nodes
- some rescued NPCs

## Run-only resources

### Health
Hero survivability inside run.

### Energy or mana
Optional for magic-heavy cards. Can be postponed if starting with a simple energy system.

### Consumables
Potions, bombs, herbs. Usually lost or spent during run.

---

# 9. Villagers and rescued survivors

## Purpose

Villagers are a powerful bridge between runs and village growth. Rescuing a villager should feel more meaningful than collecting raw wood or gold.

Villagers are effectively content unlocks in human form.

## MVP villager types

### Blacksmith Apprentice
Unlocks:

- better Forge upgrade speed
- one mid-run weapon upgrade event in future runs

### Herbalist
Unlocks:

- passive herb generation
- new potion recipes

### Scout
Unlocks:

- more map vision
- better event previews

### Priest or Acolyte
Unlocks:

- shrine blessing improvements
- better curse removal

### Mercenary
Unlocks:

- companion option
- stronger starting block or attack package

### Cook
Unlocks:

- improved healing at campsites
- pre-run meal buffs

## Design rule

Villagers should not mostly be passive resource multipliers. They should unlock systems, choices, or situational advantages.

---

# 10. Run structure

## Run fantasy

A run is a dangerous expedition from the village into a ruined wilderness, crypt, forest, battlefield, or cursed road.

## MVP run structure

- 1 starting node
- 3 to 4 branching tiers
- 1 boss at the end
- around 8 to 12 total nodes per run

## Node types

### Combat
Standard enemy encounter.

Rewards:

- a card reward
- some resources
- chance for consumable

### Elite Combat
Harder encounter.

Rewards:

- better resources
- relic shard chance
- higher-tier card or relic

### Camp
Rest or recover.

Choices:

- heal
- upgrade one card
- cook or brew if unlocked

### Event
Narrative choice node.

Examples:

- rescue survivor
- trade resources for blessing
- take curse for rare loot
- choose between immediate reward and village consequence

### Resource Node
Get wood, iron, herbs, or blueprint scraps.

### Merchant
Buy card, consumable, or relic with run currency or barter.

### Boss
End-of-run major fight.

Rewards:

- large permanent reward
- blueprint scrap
- relic shard
- major unlock potential

## Recommended MVP zones

Start with only one biome or region, such as:

- The Ashen Road
- The Hollow Forest
- The Sunken Battlefield

One zone is enough for MVP.

---

# 11. Combat system

## Goal

Combat should be readable and tactical, not overbuilt.

## Recommended combat model

A light deckbuilding combat system inspired by Slay the Spire.

### Basic turn structure

- draw hand
- spend energy
- play attack, defense, utility, or status cards
- enemy takes turn
- repeat

## MVP combat rules

- player has HP
- enemies have HP and simple intents
- player draws 5 cards each turn
- player has 3 energy per turn
- cards cost 0 to 2 energy
- player can build around attack, defense, poison, or utility

## Starting deck example

- 4x Strike
- 4x Guard
- 1x Quick Step
- 1x Village Tool

This should immediately branch based on village unlocks.

## Important design rule

Village progression should change:

- what starting cards are offered
- what reward pools are available
- which mechanics are viable

The village should not simply replace Strike 4 with Strike 10.

---

# 12. Card philosophy

## Card categories

### Attack
Deals direct damage or marks targets.

### Defense
Block, armor, mitigation, counters.

### Utility
Draw, energy gain, setup, cleanse, map tools.

### Status
Poison, bleed, burn, curse, weakness, vulnerability.

### Build-around cards
Cards that define an archetype.

## Card design rules

1. Raw damage should scale slowly.
2. Synergy should scale meaningfully.
3. Cards should support multiple archetypes.
4. Cards from village unlocks should add new play patterns.
5. Rare cards should open choices, not only add bigger numbers.

## Example starter evolution

Bad version:

- Strike I: 4 damage
- Strike II: 7 damage
- Strike III: 11 damage

Better version:

- Strike: 4 damage
- Tempered Strike: 4 damage, gain 1 armor if forged gear equipped
- Marked Blow: 3 damage, extra effect on marked enemy
- Rotting Edge: 3 damage, applies poison if herbal tools unlocked

This preserves scale while increasing possibility space.

---

# 13. Hero archetypes

## Purpose

Hero choice is another bridge between village identity and run identity.

## Recommended MVP heroes

### 1. Warden
A basic durable fighter.

Playstyle:

- balanced attacks and defense
- easy entry point
- benefits from Forge and Inn

### 2. Forager
A survivalist using herbs, poison, and adaptability.

Playstyle:

- healing
- poison
- flexible utility
- benefits from Herbal Hut and Watchtower

### 3. Acolyte
Optional for post-MVP or late MVP.

Playstyle:

- blessings
- curses
- relic synergy
- benefits from Shrine

For MVP, starting with 2 heroes is enough.

---

# 14. Enemy design

## Core principle

Enemies must create different tactical problems, not only bigger HP bars.

## MVP enemy roles

### Basic attacker
Simple benchmark enemy.

### Defender
Uses armor or block. Punishes weak chip damage.

### Glass cannon
Low HP but dangerous if ignored.

### Support unit
Buffs or heals allies. Creates target-priority decisions.

### Inflictor
Applies poison, curse, or weakness.

### Summoner
Creates extra units over time. Punishes slow play.

## Boss design goals

Bosses should test build quality and run planning.

Examples:

### The Ash Knight
Tests defense and timing.

### Rotmother
Tests poison management and attrition.

### Hollow Seer
Tests curse control and utility.

Only one or two bosses are required for MVP.

---

# 15. Avoiding fake progression

## The core problem

Many progression games secretly do this:

- early card: 1 damage
- late card: 10 damage
- early enemy: 5 HP
- late enemy: 50 HP

The player feels stronger numerically, but the tactical reality is the same.

## Our solution

Village progression should mostly unlock:

- new card families
- starting choices
- support systems
- resource processing
- route control
- meta tools
- new counters to enemy mechanics

Enemy progression should mostly increase:

- decision pressure
- mechanic variety
- synergy requirements
- risk management

## Practical balance rules

- keep base damage in a narrow range
- keep HP growth moderate
- scale enemy mechanics faster than enemy HP
- make late builds more expressive, not just bigger
- keep constraints alive, such as hand size, limited relic slots, limited consumables, or route scarcity

---

# 16. Village-to-run connections

This is the heart of the game.

## Type A: Starting loadout changes

Example:

- Forge level 2 unlocks a stronger opening weapon package
- Herbal Hut level 2 adds healing herbs to the start of each run
- Inn level 2 lets the player choose one support companion

## Type B: Reward pool changes

Example:

- Shrine unlocks blessing cards in rewards
- Herbal Hut unlocks poison cards and potion events
- Forge unlocks heavier attacks and armor cards

## Type C: Map control changes

Example:

- Watchtower reveals more nodes
- Scouts increase safe event chance
- Shrine can bless one path before entering

## Type D: Mid-run service changes

Example:

- Blacksmith villager enables one camp upgrade option
- Cook improves camp healing
- Acolyte can cleanse one curse on the map

## Type E: Long-term specialization

Example:

- military village supports Warden build and direct combat
- alchemy village supports poison and sustain
- spiritual village supports curses, blessings, and relic play

---

# 17. Idle layer design

## Goal

The idle layer should support the fantasy of a living village, but it should not replace the need to do runs.

## MVP idle model

The player earns a modest amount of passive resources over time.

Recommended:

- wood trickles in slowly
- food trickles in once a basic farm or cook is unlocked
- herbs grow slowly after Herbal Hut unlock

The passive income should help the player:

- afford minor upgrades between runs
- feel that the village is alive
- reduce some grind

It should **not** make runs optional.

## Design rule

Rare resources and meaningful unlocks should still come from runs.

Runs should remain the main source of:

- relic shards
n- blueprints
- rescued villagers
- high-value gear materials
- advanced cards and relics

---

# 18. Progression structure

## Early game

Player state:

- tiny village
- one or two basic buildings
- one hero
- simple enemies
- low map knowledge

Main player goals:

- survive runs
- unlock first core buildings
- rescue first villagers
- understand the loop

## Mid game

Player state:

- 3 to 5 developed village systems
- multiple hero or archetype choices
- broader card pool
- route control tools

Main player goals:

- specialize village direction
- craft stronger preparation tools
- build synergies
- handle enemy mechanics more intelligently

## Late MVP state

Player state:

- village identity becoming distinct
- advanced tools unlocked
- run starts feel shaped by past choices

Main player goals:

- defeat hardest current boss
- optimize a favorite archetype
- prepare for post-MVP content additions

---

# 19. Suggested first content package

## Buildings

- Forge
- Herbal Hut
- Shrine
- Watchtower
- Inn

## Heroes

- Warden
- Forager

## Villagers

- Blacksmith Apprentice
- Herbalist
- Scout
- Cook
- Priest
- Mercenary

## Resources

- Wood
- Iron
- Herbs
- Food
- Relic Shards
- Blueprint Scraps

## Cards

Target for MVP:

- 25 to 40 total cards

Breakdown:

- 8 attack
- 8 defense
- 6 utility
- 6 status/archetype
- 3 to 5 rare build-around cards

## Enemies

Target for MVP:

- 10 to 15 enemies
- 2 elites
- 1 or 2 bosses

## Events

Target for MVP:

- 8 to 12 events

## Relics

Target for MVP:

- 10 to 15 relics

---

# 20. Example content

## Example cards

### Iron Strike
Cost 1
Deal 4 damage.

### Guard Up
Cost 1
Gain 5 block.

### Herbal Poultice
Cost 1
Heal 3. Exhaust.

### Mark Target
Cost 1
Apply Mark. Marked enemies take bonus damage from some attacks.

### Temper Shield
Cost 1
Gain 4 block. If Forge level 2 reached, gain 1 armor.

### Rotknife
Cost 1
Deal 3 damage. Apply 2 poison.

### Scout Ahead
Cost 0
Draw 1. Next combat starts with one enemy intent revealed.

### Shrine Spark
Cost 1
Deal 2 damage. Gain 1 blessing charge.

## Example relics

### Ashen Ring
First Guard card each combat gains +2 block.

### Scout Charm
Reveal one extra node tier on each run.

### Bitter Vial
Poison effects deal bonus damage on the first enemy affected each combat.

### Chapel Thread
Remove one minor curse at the start of boss combat.

---

# 21. Example run flow

## Before run

The player enters the village screen and sees:

- Forge level 2
- Herbal Hut level 1
- Watchtower level 1
- rescued Scout and Herbalist

Available pre-run choices:

- choose Warden or Forager
- equip one crafted potion
- choose one starting package
- view partial route preview

The player chooses Forager.

### Starting effects from village

- starts with 1 healing herb
- poison cards can appear in rewards
- first branch of map is revealed
- one scouting event becomes more likely

## During run

The player fights:

- basic enemies
- a defender enemy requiring more focused damage
- an event where a villager can be rescued
- a camp where one card may be upgraded
- an elite that drops a relic shard

The player rescues a Cook.

## After run

Back in the village:

- the Cook unlocks meal buffs
- herbs and iron allow a small building upgrade
- blueprint scrap unlocks the next Herbal Hut tier
- future camp healing improves

The next run is meaningfully changed without simple stat inflation.

---

# 22. UX and interface plan

## Main screens for MVP

### 1. Village screen
Should show:

- building panel
- resource totals
- villager roster
- available upgrades
- hero selection button
- start run button

### 2. Run map screen
Should show:

- current node
- visible next nodes
- hero HP and key resources
- current deck and relic summary

### 3. Combat screen
Should show:

- player HP
- enemy HP and intent
- hand
- draw pile and discard count
- energy
- active statuses

### 4. Reward screen
Should show:

- card rewards
- resource rewards
- villager rescue result
- relic option when applicable

## UI principles

- dark but readable
- compact panels
- minimal clutter
- strong feedback on upgrades and unlocks
- clear distinction between permanent and run-only rewards

---

# 23. Technical MVP recommendation

## Frontend

A browser-first client with fast UI iteration.

Recommended options:

- **React** with TypeScript
- **Tailwind** or simple CSS modules for UI
- optional state library like Zustand

## Backend

For MVP, keep backend lightweight.

Recommended options:

- Node backend or Python backend
- simple REST API
- persistent save storage

## Data needs

For a first MVP, you need to persist:

- village state
- buildings and levels
- unlocked heroes
- rescued villagers
- permanent resources
- unlock flags
- active run state, if runs can be resumed

## Deployment

Browser game should be easy to host.

Suggested MVP approach:

- frontend on Netlify or Vercel
- backend on a small VPS or serverless platform
- database with Postgres or even SQLite during earliest local prototypes

---

# 24. Suggested data model

## Player profile

Fields:

- player_id
- created_at
- last_login
- village_state
- unlocked_content
- current_run_id

## Village state

Fields:

- building_levels
- resources
- villagers
- idle_timers or last_collection_timestamp
- hero_unlocks
- relic_collection

## Run state

Fields:

- hero_type
- deck
- discard_pile
- draw_pile
- relics
- hp
- map_seed
- current_node
- run_rewards_pending

## Building definition

Fields:

- id
- name
- description
- max_level
- unlock_requirements
- per_level_effects

## Card definition

Fields:

- id
- name
- energy_cost
- tags
- base_effects
- upgrade_effects
- unlock_conditions

## Enemy definition

Fields:

- id
- name
- hp
- role
- intent_patterns
- tags
- reward_table

---

# 25. Balancing rules for the MVP

## Rule 1
Keep permanent progression impactful but narrow.

## Rule 2
A new mechanic is usually more valuable than a flat stat boost.

## Rule 3
Enemy variety should outpace number inflation.

## Rule 4
The player should not be able to remove all friction. Keep limits in place.

## Rule 5
Rare rewards should open interesting lines of play.

## Rule 6
Each building should answer at least one distinct gameplay problem.

### Example mapping

- Forge answers damage and durability
- Herbal Hut answers sustain and poison
- Shrine answers curses and blessings
- Watchtower answers uncertainty and route risk
- Inn answers recruitment and run flexibility

---

# 26. Production roadmap

## Phase 1: prototype the loop

Build only:

- one hero
- one village screen
- one run map
- simple combat
- three building upgrades
- a few cards
- a few enemies

Goal:

Prove the loop is fun.

## Phase 2: connect village to run properly

Add:

- unlock-driven card pool changes
- villager rescue system
- pre-run prep choices
- first meaningful archetype split

Goal:

Prove the village actually changes future runs.

## Phase 3: add content and polish

Add:

- second hero
- more cards
- more events
- first boss variety
- better reward feedback
- save system polish

Goal:

Reach a replayable MVP.

---

# 27. First sprint breakdown

## Sprint 1

- define visual placeholder style
- implement village state structure
- implement basic combat loop
- implement card system
- implement simple branching map

## Sprint 2

- add Forge and Herbal Hut
- connect building unlocks to starting loadout and reward pool
- add 8 to 12 cards
- add 5 enemies
- add rewards and return-to-village flow

## Sprint 3

- add villagers
- add Watchtower and Inn
- add map visibility changes
- add hero selection
- add one elite and one boss

## Sprint 4

- add Shrine
- add more events
- add balancing pass
- add UI clarity and progression feedback
- prepare playtest build

---

# 28. Risks and traps

## Trap 1: too much idle, not enough game

If passive production becomes too strong, runs stop mattering.

## Trap 2: too much deckbuilder complexity too early

Too many keywords, statuses, and exceptions will slow the prototype.

## Trap 3: fake progression

Avoid large number inflation without added decisions.

## Trap 4: village upgrades that only feel abstract

If upgrades only change hidden values, the player will not feel the connection.

## Trap 5: overscoping content

One zone, two heroes, five buildings, and 30ish cards is enough for MVP.

---

# 29. Future expansion ideas after MVP

Not required now, but useful as a north star.

## Social and friends layer

- asynchronous raids against ghost villages
- shared weekly seed
- boss race leaderboards
- alliances or trade caravans

## Village pressures

- corruption
- seasons
- famine
- external attacks

## Additional zones

- frozen pass
- plague marsh
- broken cathedral
- old mines

## Additional archetypes

- curse acolyte
- trap hunter
- relic knight
- blood alchemist

## Compact factory layer

Later, village buildings could gain adjacency or small production chains without turning into a full logistics game.

Example:

- farm feeds cook
- cook improves inn
- inn supports recruits
- forge consumes iron and fuel

Keep this small and readable.

---

# 30. Final MVP definition

If forced to describe the MVP in plain terms, it is this:

A dark fantasy browser game where the player grows a small village, chooses a hero, goes on a short card-based run, returns with loot and rescued villagers, and uses those rewards to unlock new village functions that change future runs through better prep, new card pools, and improved map control.

That is enough.

Do not build beyond that until this loop feels genuinely strong.

---

# 31. Immediate next actions

## Design actions

1. Lock the fantasy and working title.
2. Lock the 5 MVP village buildings.
3. Lock the 2 starting heroes.
4. Define the first 20 to 30 cards.
5. Define the first 10 enemies and 1 boss.

## Product actions

1. Build a clickable village screen wireframe.
2. Build a combat prototype with placeholder art.
3. Build a run flow from village to combat to reward to village.
4. Validate whether village upgrades actually change next-run choices.

## Validation question

After the first playable build, ask:

**When I upgrade the village, do I feel smarter and more flexible on the next run, or just numerically stronger?**

If the answer is the first one, the game is on the right track.

---

# 32. Compact reference sheet

## The promise

Runs feed the village. The village reshapes future runs.

## The loop

Village prep -> run -> return with loot -> upgrade -> new options -> run again

## The MVP scope

- 1 village screen
- 5 buildings
- 2 heroes
- 25 to 40 cards
- 10 to 15 enemies
- 1 zone
- 1 to 2 bosses

## The anti-bloat rule

Prefer new decisions over bigger numbers.

## The anti-fake-progression rule

Scale mechanics faster than stats.

## The design north star

The village should feel like a strategic machine that changes how the next expedition plays.
