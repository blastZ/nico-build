import { promises as fs } from 'fs';
import shell from 'shelljs';
import path from 'path';
import os from 'os';
import { deepmerge } from '@blastz/nico-utility';
import { CommonConfig } from './config';

const ncc = require('@zeit/ncc');

export interface Config extends CommonConfig {
  type: 'ncc';
  name?: string;
  cache?: string | false;
  externals?: string[];
  filterAssetBase?: string;
  minify?: boolean;
  sourceMap?: boolean;
  sourceMapBasePrefix?: string;
  sourceMapRegister?: boolean;
  watch?: boolean;
  v8cache?: boolean;
  quiet?: boolean;
  debugLog?: boolean;
}

export default async function nccCompile(inputConfig: Config) {
  const config: Config = deepmerge(DEFAULT_NCC_CONFIG, inputConfig || {});

  await compile(config);
}

const compile = async (config: Config) => {
  const { input, output, type, name, ...nccConfigs } = config;
  const { err, code, map, assets }: { err: Error; code: string; map: any; assets: object } = await ncc(input, nccConfigs);

  await fs.writeFile(path.resolve(output, `./${config.name ?? 'app'}.js`), code);

  if (assets) {
    await Promise.all(
      Object.entries(assets).map(async ([name, { source }]) => {
        const dir = path.resolve(output, path.dirname(name));

        if (!shell.test('-d', dir)) {
          shell.mkdir('-p', dir);
        }

        await fs.writeFile(path.resolve(output, `./${name}`), source);
      })
    );
  }
};

const DEFAULT_NCC_CONFIG = {
  cache: path.resolve(os.tmpdir(), './nico-build/ncc/.cache'),
  externals: [],
  filterAssetBase: process.cwd(),
  minify: true,
  sourceMap: false,
  sourceMapBasePrefix: '../',
  sourceMapRegister: true,
  watch: false,
  v8cache: false,
  quiet: true,
  debugLog: false
};
