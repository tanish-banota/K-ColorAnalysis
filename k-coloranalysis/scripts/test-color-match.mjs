import assert from "node:assert/strict";
import { buildRegionColor, chooseSeason, scorePortraitColors } from "../lib/k-color-analysis.ts";

const region = (rgb, saturation, lightness, red, yellow) => ({
  rgb,
  hsl: { s: saturation },
  lab: { l: lightness, a: red, b: yellow },
});

const eyes = region([55, 45, 45], 20, 20, 2, 4);
const hair = region([70, 55, 45], 25, 28, 4, 8);
const options = { hairDyed: false, wearingMakeup: false };

const warm = scorePortraitColors(
  region([200, 150, 105], 45, 66, 15, 28), eyes, hair, options,
);
const cool = scorePortraitColors(
  region([185, 130, 140], 29, 59, 25, 8), eyes, hair, options,
);

assert.ok(warm.warmScore > 0, "yellow leaning skin should score warm");
assert.ok(cool.warmScore < 0, "pink leaning skin should score cool");
assert.notEqual(warm.valueScore, cool.valueScore);
assert.notEqual(warm.chromaScore, cool.chromaScore);
assert.equal(chooseSeason(warm).primarySeason, "Autumn");
assert.equal(chooseSeason(cool).primarySeason, "Winter");
console.log("Warm and cool photo samples produce different match scores.");

const sampleMatches = [];
for (const [name, rgb, expectedSeason] of [
  ["fair pink", [220, 169, 164], "Winter"],
  ["fair golden", [220, 180, 140], "Spring"],
  ["medium olive", [170, 130, 97], "Autumn"],
  ["deep neutral", [113, 78, 65], "Autumn"],
  ["deep golden", [139, 93, 58], "Autumn"],
]) {
  const scores = scorePortraitColors(
    buildRegionColor(rgb),
    buildRegionColor([55, 45, 43]),
    buildRegionColor([53, 40, 35]),
    options,
  );
  const season = chooseSeason(scores);
  assert.equal(season.primarySeason, expectedSeason, name);
  sampleMatches.push(`${name}: ${season.toneSubtype}`);
}
console.log(sampleMatches.join("; "));
