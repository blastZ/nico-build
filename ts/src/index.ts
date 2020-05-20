import path from 'path';
import fs from 'fs';
import shell from 'shelljs';
import os from 'os';

const bytenode = require('./lib/bytenode');
const ncc = require('@zeit/ncc');

export = async (filePath: string, outDir: string) => {
  const distPath = outDir;

  shell.rm('-rf', distPath);
  shell.mkdir('-p', distPath);

  const { code, map, assets }: { code: string; map: any; assets: object } = await ncc(filePath, {
    cache: path.resolve(os.tmpdir(), './nico-build/ncc/.cache'),
    externals: [],
    filterAssetBase: process.cwd(),
    minify: true,
    sourceMap: false,
    sourceMapBasePrefix: '../',
    sourceMapRegister: true,
    watch: false,
    v8cache: false,
    quiet: false,
    debugLog: false
  });

  fs.writeFileSync(path.resolve(distPath, './index.js'), code);
  if (assets) {
    Object.entries(assets).map(([name, { source }]) => {
      const dir = path.dirname(name);
      if (!fs.existsSync(path.resolve(distPath, dir))) {
        shell.mkdir('-p', path.resolve(distPath, dir));
      }

      fs.writeFileSync(path.resolve(distPath, `./${name}`), source);
    });
  }

  // shell.cp('-R', path.resolve(__dirname, './template/app.js'), path.resolve(__dirname, './dist'));
  // shell.cp('-R', path.resolve(__dirname, '../config.js'), path.resolve(__dirname, './dist'));
  // shell.cp('-R', path.resolve(__dirname, './template/ecosystem.config.js'), path.resolve(__dirname, './dist'));

  // bytenode.compileFile({
  //   filename: path.resolve(__dirname, './dist/index.js'),
  //   output: path.resolve(__dirname, './dist/index.robot')
  // });

  // shell.cp('-R', path.resolve(__dirname, './lib/bytenode.js'), path.resolve(__dirname, './dist'));
  // shell.rm('-rf', path.resolve(__dirname, './dist/index.js'));
};
