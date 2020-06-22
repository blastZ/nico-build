import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import shell from 'shelljs';
import os from 'os';
import JavaScriptObfuscator from 'javascript-obfuscator';

const bytenode = require('./lib/bytenode');
const ncc = require('@zeit/ncc');

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

const DEFAULT_BYTENODE_CONFIG = {
  extName: '.robot'
};

export default async function build(input: string, output: string, inputConfig?: Config) {
  const config: Config = {
    rmDist: false,
    outputName: 'index',
    ncc: DEFAULT_NCC_CONFIG,
    bytenode: DEFAULT_BYTENODE_CONFIG,
    ...inputConfig
  };

  const origin = path.resolve(input);
  const dist = path.resolve(output);

  if (!fs.existsSync(origin)) {
    throw new Error('Input file not found');
  }

  if (config.rmDist) {
    shell.rm('-rf', dist);
  }

  if (!fs.existsSync(dist)) {
    shell.mkdir('-p', dist);
  }

  await compile(origin, dist, config);
  await template(origin, dist, config);
  await binary(origin, dist, config);
}

const binary = async (origin: string, dist: string, config: Config) => {
  const name = config.outputName || 'index';
  const input = path.resolve(dist, `./${name}.js`);
  const output = path.resolve(dist, `./${name}.robot`);

  bytenode.compileFile({
    filename: input,
    output
  });

  shell.rm('-rf', input);
};

const template = async (origin: string, dist: string, config: Config) => {
  shell.cp('-R', path.resolve(__dirname, './template/ecosystem.config.js'), path.resolve(dist, './ecosystem.config.js'));
  shell.cp('-R', path.resolve(__dirname, './template/app.js'), path.resolve(dist, './app.js'));
  shell.cp('-R', path.resolve(__dirname, './template/config.js'), path.resolve(dist, './config.js'));

  const engineSrc = (await fsPromises.readFile(path.resolve(__dirname, './lib/bytenode.js'), { encoding: 'utf8' })).toString();
  const engine = JavaScriptObfuscator.obfuscate(engineSrc, {
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    compact: true,
    selfDefending: true,
    target: 'node'
  }).getObfuscatedCode();

  await fsPromises.writeFile(path.resolve(dist, './engine.js'), engine);
};

const compile = async (origin: string, dist: string, config: Config) => {
  const originStat = await fsPromises.stat(origin);

  if (originStat.isDirectory()) {
    if (config.ncc) {
      const entry = path.resolve(origin, './index.js');

      if (!fs.existsSync(entry)) {
        throw new Error('Input must be a file');
      }

      await nccCompile(entry, dist, config);
    }
  } else {
    if (config.ncc) {
      await nccCompile(origin, dist, config);
    }
  }

  // shell.cp('-R', path.resolve(__dirname, './template/app.js'), path.resolve(__dirname, './dist'));
  // shell.cp('-R', path.resolve(__dirname, '../config.js'), path.resolve(__dirname, './dist'));

  // bytenode.compileFile({
  //   filename: path.resolve(__dirname, './dist/index.js'),
  //   output: path.resolve(__dirname, './dist/index.robot')
  // });

  // shell.cp('-R', path.resolve(__dirname, './lib/bytenode.js'), path.resolve(__dirname, './dist'));
  // shell.rm('-rf', path.resolve(__dirname, './dist/index.js'));
};

const nccCompile = async (origin: string, dist: string, config: Config) => {
  const { err, code, map, assets }: { err: Error; code: string; map: any; assets: object } = await ncc(origin, config);

  await fsPromises.writeFile(path.resolve(dist, `./${config.outputName}.js`), code);

  if (assets) {
    await Promise.all(
      Object.entries(assets).map(async ([name, { source }]) => {
        const dir = path.resolve(dist, path.dirname(name));

        if (!fs.existsSync(dir)) {
          shell.mkdir('-p', dir);
        }

        await fsPromises.writeFile(path.resolve(dist, `./${name}`), source);
      })
    );
  }
};

type NccConfig =
  | {
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
  | false;

type BytenodeConfig =
  | {
      extName: string;
    }
  | false;

type Config = {
  rmDist?: boolean;
  outputName?: string;
  ncc?: NccConfig;
  bytenode?: BytenodeConfig;
};
