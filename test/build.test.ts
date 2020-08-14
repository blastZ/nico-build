import path from 'path';

import build from '../src/index';

test('Error input', async () => {
  await expect(build(path.resolve(__dirname, './assets/app2'), path.resolve(__dirname, './dist'))).rejects.toThrow();
});

test('Compile', async () => {
  await build(path.resolve(__dirname, './apps/nico'), path.resolve(__dirname, './dist'), {
    ecosystem: {
      name: 'npm-test',
      env: {
        PORT: '1315',
        STATUS: '0'
      }
    },
    appConfig: {
      custom: {
        COOKIE_CONFIG: {
          domain: '.stackbunch.com'
        },
        userList: [
          { name: 'a', age: 1 },
          { name: 'b', age: 2 }
        ]
      }
    }
  });
});
