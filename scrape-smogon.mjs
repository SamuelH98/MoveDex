#!/usr/bin/env node
// Scrape ALL Smogon competitive sets from data.pkmn.cc across every generation and tier.
// Output a DEX object for MoveDex with maximum coverage.

import {writeFileSync} from 'fs';

const BASE = 'https://data.pkmn.cc/sets';

// Every tier from every generation
const ALL_TIERS = [
  // Gen 9
  'gen9ou','gen9uu','gen9ru','gen9nu','gen9pu','gen9zu',
  'gen9ubers','gen9ubersuu','gen9anythinggoes',
  'gen9nationaldex','gen9nationaldexuu','gen9nationaldexru','gen9nationaldexubers','gen9nationaldexmonotype',
  'gen9monotype','gen9lc','gen9doublesou',
  'gen91v1','gen9cap','gen9nfe',
  'gen9battlestadiumsingles','gen9vgc2025',
  'gen9godlygift','gen9balancedhackmons','gen9almostanyability',
  'gen9stabmons','gen9mixandmega','gen9partnersincrime',
  // Gen 8
  'gen8ou','gen8uu','gen8ru','gen8nu','gen8pu','gen8zu',
  'gen8ubers','gen8anythinggoes','gen8lc',
  'gen8monotype','gen8doublesou','gen81v1','gen8cap',
  'gen8nationaldex','gen8nationaldexag','gen8nationaldexmonotype','gen8nationaldexru',
  'gen8battlestadiumsingles','gen8bdspou',
  'gen8balancedhackmons','gen8almostanyability','gen8mixandmega',
  'gen8godlygift','gen8stabmons',
  // Gen 7
  'gen7ou','gen7uu','gen7ru','gen7nu','gen7pu','gen7zu',
  'gen7ubers','gen7anythinggoes','gen7lc',
  'gen7monotype','gen7doublesou','gen71v1','gen7cap','gen7nfe',
  'gen7battlespotsingles',
  'gen7balancedhackmons','gen7almostanyability','gen7mixandmega',
  // Gen 6
  'gen6ou','gen6uu','gen6ru','gen6nu','gen6pu','gen6zu',
  'gen6ubers','gen6anythinggoes','gen6lc',
  'gen6monotype','gen6doublesou','gen61v1','gen6cap',
  'gen6balancedhackmons','gen6almostanyability','gen6mixandmega',
  // Gen 5
  'gen5ou','gen5uu','gen5ru','gen5nu','gen5pu','gen5zu',
  'gen5ubers','gen5anythinggoes','gen5lc',
  'gen5monotype','gen5doublesou',
  // Gen 4
  'gen4ou','gen4uu','gen4nu','gen4pu','gen4zu',
  'gen4ubers','gen4anythinggoes','gen4lc','gen4cap',
  // Gen 3
  'gen3ou','gen3uu','gen3ru','gen3nu','gen3pu','gen3zu',
  'gen3ubers','gen3lc',
  // Gen 2
  'gen2ou','gen2uu','gen2nu','gen2pu','gen2zu','gen2ubers','gen21v1',
  // Gen 1
  'gen1ou','gen1uu','gen1nu','gen1pu','gen1zu','gen1ubers',
];

// Priority for tier labels: lower index = preferred
const TIER_PRIORITY = [
  'gen9ou','gen9uu','gen9ru','gen9nu','gen9pu','gen9zu',
  'gen9nationaldex','gen9monotype','gen9ubers','gen9ubersuu',
  'gen9doublesou','gen91v1','gen9cap','gen9nfe','gen9lc',
  'gen9anythinggoes','gen9vgc2025','gen9battlestadiumsingles',
  'gen9godlygift','gen9balancedhackmons','gen9almostanyability',
  'gen9stabmons','gen9mixandmega','gen9partnersincrime',
  'gen9nationaldexuu','gen9nationaldexru','gen9nationaldexubers','gen9nationaldexmonotype',
  // Gen 8
  'gen8ou','gen8uu','gen8ru','gen8nu','gen8pu','gen8zu',
  'gen8nationaldex','gen8monotype','gen8ubers','gen8lc',
  'gen8doublesou','gen81v1','gen8cap','gen8nfe',
  'gen8anythinggoes','gen8battlestadiumsingles','gen8bdspou',
  'gen8balancedhackmons','gen8almostanyability','gen8mixandmega',
  'gen8godlygift','gen8stabmons','gen8nationaldexag','gen8nationaldexmonotype','gen8nationaldexru',
  // Gen 7
  'gen7ou','gen7uu','gen7ru','gen7nu','gen7pu','gen7zu',
  'gen7ubers','gen7monotype','gen7lc','gen71v1','gen7cap','gen7nfe',
  'gen7doublesou','gen7anythinggoes','gen7battlespotsingles',
  'gen7balancedhackmons','gen7almostanyability','gen7mixandmega',
  // Gen 6
  'gen6ou','gen6uu','gen6ru','gen6nu','gen6pu','gen6zu',
  'gen6ubers','gen6monotype','gen6lc','gen61v1','gen6cap',
  'gen6doublesou','gen6anythinggoes',
  'gen6balancedhackmons','gen6almostanyability','gen6mixandmega',
  // Gen 5
  'gen5ou','gen5uu','gen5ru','gen5nu','gen5pu','gen5zu',
  'gen5ubers','gen5monotype','gen5lc','gen5doublesou','gen5anythinggoes',
  // Gen 4
  'gen4ou','gen4uu','gen4nu','gen4pu','gen4zu',
  'gen4ubers','gen4lc','gen4cap','gen4anythinggoes',
  // Gen 3
  'gen3ou','gen3uu','gen3ru','gen3nu','gen3pu','gen3zu',
  'gen3ubers','gen3lc',
  // Gen 2
  'gen2ou','gen2uu','gen2nu','gen2pu','gen2zu','gen2ubers','gen21v1',
  // Gen 1
  'gen1ou','gen1uu','gen1nu','gen1pu','gen1zu','gen1ubers',
];

const TIER_LABELS = {
  'gen9ou':'OU','gen9uu':'UU','gen9ru':'RU','gen9nu':'NU','gen9pu':'PU','gen9zu':'ZU',
  'gen9ubers':'Uber','gen9ubersuu':'Ubers UU','gen9anythinggoes':'AG',
  'gen9nationaldex':'National Dex','gen9nationaldexuu':'NatDex UU',
  'gen9nationaldexru':'NatDex RU','gen9nationaldexubers':'NatDex Uber','gen9nationaldexmonotype':'NatDex Monotype',
  'gen9monotype':'Monotype','gen9lc':'LC','gen9doublesou':'Doubles OU',
  'gen91v1':'1v1','gen9cap':'CAP','gen9nfe':'NFE',
  'gen9battlestadiumsingles':'BSS','gen9vgc2025':'VGC 2025',
  'gen9godlygift':'Godly Gift','gen9balancedhackmons':'BH',
  'gen9almostanyability':'AAA','gen9stabmons':'STABmons',
  'gen9mixandmega':'M&M','gen9partnersincrime':'PiC',
  'gen8ou':'OU','gen8uu':'UU','gen8ru':'RU','gen8nu':'NU','gen8pu':'PU','gen8zu':'ZU',
  'gen8ubers':'Uber','gen8anythinggoes':'AG','gen8lc':'LC',
  'gen8monotype':'Monotype','gen8doublesou':'Doubles OU','gen81v1':'1v1','gen8cap':'CAP','gen8nfe':'NFE',
  'gen8nationaldex':'National Dex','gen8battlestadiumsingles':'BSS','gen8bdspou':'BDSP OU',
  'gen8balancedhackmons':'BH','gen8almostanyability':'AAA','gen8mixandmega':'M&M',
  'gen8godlygift':'Godly Gift','gen8stabmons':'STABmons',
  'gen8nationaldexag':'NatDex AG','gen8nationaldexmonotype':'NatDex Mono','gen8nationaldexru':'NatDex RU',
  'gen7ou':'OU','gen7uu':'UU','gen7ru':'RU','gen7nu':'NU','gen7pu':'PU','gen7zu':'ZU',
  'gen7ubers':'Uber','gen7anythinggoes':'AG','gen7lc':'LC',
  'gen7monotype':'Monotype','gen7doublesou':'Doubles OU','gen71v1':'1v1','gen7cap':'CAP','gen7nfe':'NFE',
  'gen7battlespotsingles':'Battle Spot',
  'gen7balancedhackmons':'BH','gen7almostanyability':'AAA','gen7mixandmega':'M&M',
  'gen6ou':'OU','gen6uu':'UU','gen6ru':'RU','gen6nu':'NU','gen6pu':'PU','gen6zu':'ZU',
  'gen6ubers':'Uber','gen6anythinggoes':'AG','gen6lc':'LC',
  'gen6monotype':'Monotype','gen6doublesou':'Doubles OU','gen61v1':'1v1','gen6cap':'CAP',
  'gen6balancedhackmons':'BH','gen6almostanyability':'AAA','gen6mixandmega':'M&M',
  'gen5ou':'OU','gen5uu':'UU','gen5ru':'RU','gen5nu':'NU','gen5pu':'PU','gen5zu':'ZU',
  'gen5ubers':'Uber','gen5anythinggoes':'AG','gen5lc':'LC',
  'gen5monotype':'Monotype','gen5doublesou':'Doubles OU',
  'gen4ou':'OU','gen4uu':'UU','gen4nu':'NU','gen4pu':'PU','gen4zu':'ZU',
  'gen4ubers':'Uber','gen4anythinggoes':'AG','gen4lc':'LC','gen4cap':'CAP',
  'gen3ou':'OU','gen3uu':'UU','gen3ru':'RU','gen3nu':'NU','gen3pu':'PU','gen3zu':'ZU',
  'gen3ubers':'Uber','gen3lc':'LC',
  'gen2ou':'OU','gen2uu':'UU','gen2nu':'NU','gen2pu':'PU','gen2zu':'ZU',
  'gen2ubers':'Uber','gen21v1':'1v1',
  'gen1ou':'OU','gen1uu':'UU','gen1nu':'NU','gen1pu':'PU','gen1zu':'ZU',
  'gen1ubers':'Uber',
};

function fmtEVs(evs) {
  if (Array.isArray(evs)) evs = evs[0];
  const parts = [];
  const order = ['hp','atk','def','spa','spd','spe'];
  const labels = {'hp':'HP','atk':'Atk','def':'Def','spa':'SpA','spd':'SpD','spe':'Spe'};
  for (const k of order) {
    if (evs[k]) parts.push(`${evs[k]} ${labels[k]}`);
  }
  return parts.join(' / ') || '0';
}

function pickFirst(val) {
  if (Array.isArray(val)) return val[0];
  return val;
}

function pickFirstMove(val) {
  if (Array.isArray(val)) return val[0];
  return val;
}

function genLabel(tier) {
  const m = tier.match(/^gen(\d)/);
  const gen = m ? parseInt(m[1]) : 9;
  const genNames = {1:'RBY',2:'GSC',3:'ADV',4:'DPP',5:'BW',6:'XY',7:'SM',8:'SS',9:'SV'};
  return genNames[gen] || `Gen${gen}`;
}

async function scrape() {
  const allPokemon = {};
  let successCount = 0;
  let failCount = 0;

  for (const tier of ALL_TIERS) {
    const url = `${BASE}/${tier}.json`;
    process.stderr.write(`  ${tier}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) { process.stderr.write(` ${res.status}\n`); failCount++; continue; }
      const data = await res.json();
      let count = 0;
      for (const [pokemon, sets] of Object.entries(data)) {
        if (!allPokemon[pokemon]) {
          allPokemon[pokemon] = {bestTier: tier, sets: {}};
        }
        // Track best tier for this Pokemon
        const currentBestIdx = TIER_PRIORITY.indexOf(allPokemon[pokemon].bestTier);
        const thisIdx = TIER_PRIORITY.indexOf(tier);
        if (currentBestIdx === -1 || (thisIdx !== -1 && thisIdx < currentBestIdx)) {
          allPokemon[pokemon].bestTier = tier;
        }
        // Merge sets (keep first occurrence per name)
        for (const [setName, setData] of Object.entries(sets)) {
          if (!allPokemon[pokemon].sets[setName]) {
            allPokemon[pokemon].sets[setName] = {data: setData, tier};
          }
        }
        count++;
      }
      process.stderr.write(` ${count} sets\n`);
      successCount++;
    } catch (e) {
      process.stderr.write(` err: ${e.message}\n`);
      failCount++;
    }
  }

  process.stderr.write(`\nFetched ${successCount} tiers (${failCount} failed)\n`);

  // Convert to MoveDex DEX format
  const dex = {};
  for (const [pokemon, info] of Object.entries(allPokemon)) {
    const tierLabel = TIER_LABELS[info.bestTier] || info.bestTier.replace(/gen\d/,'');
    const gen = genLabel(info.bestTier);
    const setNames = Object.keys(info.sets);
    const primaryName = setNames[0];
    const primary = info.sets[primaryName].data;

    const item = pickFirst(primary.item) || '';
    const ability = pickFirst(primary.ability) || '';
    const nature = pickFirst(primary.nature) || '';
    const evs = fmtEVs(primary.evs || {});
    const tera = pickFirst(primary.teratypes) || '';
    const moves = (primary.moves || []).map(m => pickFirstMove(m));

    const note = `${primaryName} set from Smogon ${gen} ${tierLabel}. ` +
      `Moves: ${moves.join(', ')}. ` +
      `${setNames.length > 1 ? `${setNames.length - 1} other sets available.` : ''}`;

    dex[pokemon.toLowerCase()] = {
      display: pokemon,
      api: pokemon.toLowerCase().replace(/ /g, '-'),
      tier: `${tierLabel} (${gen})` + (setNames.length > 1 ? ` · ${setNames.length} sets` : ''),
      item, ability, nature, evs, tera, moves, note,
      allSets: Object.fromEntries(
        setNames.map(name => {
          const s = info.sets[name].data;
          return [name, {
            item: pickFirst(s.item) || '',
            ability: pickFirst(s.ability) || '',
            nature: pickFirst(s.nature) || '',
            evs: fmtEVs(s.evs || {}),
            tera: pickFirst(s.teratypes) || '',
            moves: (s.moves || []).map(m => pickFirstMove(m))
          }];
        })
      )
    };
  }

  return dex;
}

process.stderr.write('Scraping ALL Smogon sets from data.pkmn.cc...\n\n');
const dex = await scrape();
const count = Object.keys(dex).length;
process.stderr.write(`\nDone. ${count} Pokemon with competitive sets.\n`);

const outPath = new URL('./smogon-dex.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(dex, null, 2));
process.stderr.write(`Written to ${outPath}\n`);
