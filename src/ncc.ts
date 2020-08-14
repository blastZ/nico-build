
import { promises as fs } from 'fs';
import shell from 'shelljs';
import path from 'path';

const ncc = require('@zeit/ncc');

export default async function nccCompile (origin: string, dist: string, config: Config)  {
    const originStat = await fs.stat(origin);

    if (originStat.isDirectory()) {
        const entry = path.resolve(origin, './index.js');
  
        if (!shell.test('-f', entry)) {
          throw new Error('Input must be a file');
        }
  
        await compile(entry, dist, config);
    } else {
        await compile(origin, dist, config);
    }
};


const compile = async (origin: string, dist: string, config: Config) => {
    const { err, code, map, assets }: { err: Error; code: string; map: any; assets: object } = await ncc(origin, config.ncc);

    await fs.writeFile(path.resolve(dist, `./${path.basename(config.outputName || 'index')}.js`), code);
  
    if (assets) {
      await Promise.all(
        Object.entries(assets).map(async ([name, { source }]) => {
          const dir = path.resolve(dist, path.dirname(name));
  
          if (!shell.test('-d', dir)) {
            shell.mkdir('-p', dir);
          }
  
          await fs.writeFile(path.resolve(dist, `./${name}`), source);
        })
      );
    }
}