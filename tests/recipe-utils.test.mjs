import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scaleIngredient, pantryMatch, ingredientText, recipeSteps, localDate, weekDays } from '../src/features/kitchen/model/recipe-utils.ts';

test('serving changes scale whole, decimal and attached-unit quantities', () => {
  assert.equal(scaleIngredient('200g pasta', 2), '400g pasta');
  assert.equal(scaleIngredient('1.5 tbsp olive oil', 0.5), '0.75 tbsp olive oil');
  assert.equal(scaleIngredient('2 cloves garlic, minced', 1.5), '3 cloves garlic, minced');
});
test('serving changes handle fractions, mixed fractions and unicode quantities', () => {
  for (const quantity of ['1½', '1 ½', '1 1/2', '3/2']) assert.equal(scaleIngredient(`${quantity} cups water`, 2), '3 cups water');
  assert.equal(scaleIngredient('½ tsp salt', 2), '1 tsp salt');
  assert.equal(scaleIngredient('¼ cup milk', 0.5), '0.13 cup milk');
});
test('free-form seasonings, ranges and invalid factors stay unchanged', () => {
  for (const text of ['Salt to taste', '1–2 chillies', '1-2 chillies', 'A pinch of cumin', '1/0 cup flour']) assert.equal(scaleIngredient(text, 2), text);
  assert.equal(scaleIngredient('2 eggs', NaN), '2 eggs');
  assert.equal(scaleIngredient('2 eggs', 0), '2 eggs');
});
test('pantry matching recognizes plurals and common names without substring matches', () => {
  assert.ok(pantryMatch('4 potatoes, peeled', ['Potato']));
  assert.ok(pantryMatch('2 tomatoes', ['Tomato']));
  assert.ok(pantryMatch('150 g shrimp', ['Prawns']));
  assert.ok(pantryMatch('1 tbsp olive oil', ['Olive oil']));
  assert.ok(pantryMatch('2 eggs', ['Egg']));
  assert.ok(pantryMatch('1 cup chickpeas', ['Chickpea']));
  assert.equal(pantryMatch('1 cup flour', ['flourish']), false);
  assert.equal(pantryMatch('4 potatoes', []), false);
});
test('recipe fields support the existing string and object formats', () => {
  assert.equal(ingredientText('2 eggs'), '2 eggs');
  assert.equal(ingredientText({ quantity: '2', unit: 'cups', name: 'rice' }), '2 cups rice');
  assert.deepEqual(recipeSteps({ id: 'x', instructions: ['Mix well', { title: 'Bake', details: 'Bake for 20 minutes' }, { title: '', details: '' }] }), [{ title: 'Step 1', details: 'Mix well' }, { title: 'Bake', details: 'Bake for 20 minutes' }]);
});
test('meal dates use local calendar days and weeks start on Monday', () => {
  assert.equal(localDate(new Date(2026, 10, 9, 23, 59)), '2026-11-09');
  const current = weekDays();
  assert.equal(current.length, 7);
  assert.equal(current[0].getDay(), 1);
  assert.equal(current[6].getDay(), 0);
  assert.equal(new Set(current.map((date) => localDate(date))).size, 7);
  const nextMonday = new Date(current[0]); nextMonday.setDate(nextMonday.getDate() + 7);
  assert.equal(localDate(weekDays(1)[0]), localDate(nextMonday));
});
