import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, click, input, key } from './helpers.mjs';
import { NumberInput, parseLocaleNumber, roundNumber } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('locale parsing, precision and safe numeric bounds', () => {
  assert.equal(parseLocaleNumber('1.234,50', 'de-DE'), 1234.5);
  assert.throws(() => parseLocaleNumber('1e10', 'en-US'));
  assert.equal(roundNumber(1.005, 2), 1.01);
  assert.equal(roundNumber(-1000.25, 1), -1000.3);
  assert.throws(() => roundNumber(1e15, 12));
});
test('step controls clamp and invalid typed values do not commit', async () => {
  const values = [];
  await ui.render(
    createElement(NumberInput, {
      defaultValue: 1,
      min: 0,
      max: 2,
      step: 1,
      onChange: (value) => values.push(value),
    }),
  );
  await click(ui.container.querySelector('[aria-label="Increase Number"]'));
  assert.equal(values.at(-1), 2);
  assert.equal(ui.container.querySelector('[aria-label="Increase Number"]').disabled, true);
  await input(ui.container.querySelector('[role="spinbutton"]'), 'bad');
  await key(ui.container.querySelector('[role="spinbutton"]'), 'Enter');
  assert.ok(ui.container.querySelector('[role="alert"]'));
  assert.equal(values.at(-1), 2);
});
