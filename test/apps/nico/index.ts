import nico from '@blastz/nico';
import { Config } from '@blastz/nico/typings';

export = (config: Config) => {
  nico.init(
    {
      routes: {
        'GET /test': {
          controller: (ctx) => {
            return ctx.body = {
              success: true
            }
          }
        }
      }
    },
    config
  );

  nico.start(1316);
};
