import nico from '@blastz/nico';
import { Config } from '@blastz/nico/typings';

export = (config: Config) => {
  nico.init(
    {
      routes: {
        'GET /test': {
          controller: require('./api/controller/get')
        }
      }
    },
    config
  );

  nico.start(1316);
};
