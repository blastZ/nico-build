import path from 'path';

import build from '../src/index';

test('Build test', async () => {
  await build(path.resolve(__dirname, './src/index.js'), path.resolve(__dirname, './build-dist'));
});
