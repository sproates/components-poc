import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
for (const [subpath, target] of Object.entries(pkg.exports)) {
  for (const file of typeof target === 'string' ? [target] : Object.values(target)) await access(file);
  if (typeof target !== 'string') await import(pkg.name + (subpath === '.' ? '' : subpath.slice(1)));
}
const { Button } = await import('@poc/design-system-components/atoms/Button');
assert.match(renderToStaticMarkup(createElement(Button, null, 'Consumer button')), /Consumer button/);
console.log('Package exports exist, import successfully, and render outside Storybook.');
