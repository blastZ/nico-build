import shell from 'shelljs';
import path from 'path';
import { promises as fs } from 'fs';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { CommonConfig } from './config';

const bytenode = require('./lib/bytenode');

export interface Config extends CommonConfig {
  type: 'bytenode';
  name?: string;
  extName?: string;
  createAppFile?: boolean;
}

export default async function bytenodeCompile(config: Config) {
  const { input, output } = config;
  const name = config?.name || 'index';
  const extName = config?.extName ?? 'robot';
  const createAppFile = config?.createAppFile ?? false;

  const origin = input;
  const dist = path.resolve(output, `./${name}.${extName}`);

  bytenode.compileFile(
    {
      filename: origin
    },
    dist
  );

  await _createEngineFile(output);

  if (config.rmInput) {
    shell.rm('-rf', input);
  }

  if (createAppFile) {
    await _createAppFile(output, { name });
  }
}

const _createEngineFile = async (output: string) => {
  const engineSrc = (await fs.readFile(path.resolve(__dirname, './lib/bytenode.js'), { encoding: 'utf8' })).toString();
  const engine = JavaScriptObfuscator.obfuscate(engineSrc, {
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    compact: true,
    selfDefending: true,
    target: 'node'
  }).getObfuscatedCode();

  await fs.writeFile(path.resolve(output, './engine.js'), engine);
};

const _createAppFile = async (output: string, config: { name: string }) => {
  const appFile = `require('./engine');\n` + `require('./${config.name}');`;

  await fs.writeFile(path.resolve(output, `./app.js`), appFile);
};
