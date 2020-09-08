import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { CommonConfig } from './config';

const { exec } = require('pkg');

export interface Config extends CommonConfig {
  type: 'pkg';
  name?: string;
  scripts?: string[];
  assets?: string[];
  targets?: string[];
}

export default async function compileWithPkg(config: Config) {
  const { input, name } = config;
  let output = undefined;
  let outputPath = config.output;
  if (name) {
    output = path.resolve(outputPath, name);
  }

  let commands = [input, '-t', (config.targets || ['node12-linux']).join(',')];

  if (output) {
    commands = commands.concat(['-o', output]);
  } else if (outputPath) {
    commands = commands.concat(['--out-path', outputPath]);
  }

  if (config.scripts || config.assets) {
    const tempPath = path.resolve(os.tmpdir(), './pkg.json');
    await fs.writeFile(
      tempPath,
      JSON.stringify({
        scripts: config.scripts,
        assets: config.assets
      })
    );

    commands = commands.concat('-c', tempPath);
  }

  await exec(commands);
}
