import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import shell from 'shelljs';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { DEFAULT_NCC_CONFIG, DEFAULT_BYTENODE_CONFIG, DEFAULT_ECOSYSTEM, DEFAULT_APP_CONFIG } from './config';
import deepmerge from './deepmerge';

const bytenode = require('./lib/bytenode');
const ncc = require('@zeit/ncc');

export default async function build(input: string, output: string, inputConfig: Config = {}) {
  const config: Config = deepmerge(
    {
      rmDist: false,
      outputName: 'index',
      ncc: DEFAULT_NCC_CONFIG,
      bytenode: DEFAULT_BYTENODE_CONFIG,
      ecosystem: DEFAULT_ECOSYSTEM,
      appConfig: DEFAULT_APP_CONFIG
    },
    inputConfig
  );

  const origin = path.resolve(input);
  const dist = path.resolve(output);

  if (!fs.existsSync(origin)) {
    throw new Error(`Input file ${origin} not found`);
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

const _appendObj = (target: string, obj: object, spaceLength: number) => {
  Object.entries(obj).map(([key, value]) => {
    const space = new Array(spaceLength).fill(' ').join('');
    if (typeof value == 'object') {
      if (Array.isArray(value)) {
        target += space + `${key}: ${JSON.stringify(value)},\n`;
      } else {
        target += space + `${key}: {\n`;
        target = _appendObj(target, value, spaceLength + 2);
        target += space + `},\n`;
      }
    } else if (typeof value == 'string') {
      target += space + `${key}: '${value}',\n`;
    } else {
      target += space + `${key}: ${value},\n`;
    }
  });

  return target;
};

const _createEcosystemFile = async (origin: string, dist: string, config: Config) => {
  let ecosystemConfig = `module.exports = {\n` + `  apps: [\n` + `    {\n`;
  ecosystemConfig = _appendObj(ecosystemConfig, config.ecosystem || {}, 6);
  ecosystemConfig += `    }\n` + `  ]\n` + `};`;

  await fsPromises.writeFile(path.resolve(dist, './ecosystem.config.js'), ecosystemConfig);
};

const _createConfigFile = async (origin: string, dist: string, config: Config) => {
  let configFile = `const config = {\n`;
  configFile = _appendObj(configFile, config.appConfig || {}, 2);
  configFile += '};\n\n' + `const env = process.env.APP_ENV || 'production';\n\n` + `module.exports = config[env];`;

  await fsPromises.writeFile(path.resolve(dist, './config.js'), configFile);
};

const _createAppFile = async (origin: string, dist: string, config: Config) => {
  const appFile =
    `require('./engine');\n\n` + `const start = require('./index');\n` + `const config = require('./config');\n\n` + `start(config);`;

  await fsPromises.writeFile(path.resolve(dist, './app.js'), appFile);
};

const _createEngineFile = async (origin: string, dist: string, config: Config) => {
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

const template = async (origin: string, dist: string, config: Config) => {
  await _createEcosystemFile(origin, dist, config);
  await _createAppFile(origin, dist, config);
  await _createConfigFile(origin, dist, config);
  await _createEngineFile(origin, dist, config);
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
