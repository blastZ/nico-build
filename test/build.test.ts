import path from 'path';

import build from '../src/index';

test('Error input', async () => {
  await expect(build(path.resolve(__dirname, './assets/app2'), path.resolve(__dirname, './dist'))).rejects.toThrow('Input file not found');
});

test('Compile', async () => {
  await build(path.resolve(__dirname, './apps/nico'), path.resolve(__dirname, './dist'));
});
