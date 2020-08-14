import path from 'path';
import os from 'os';

export const DEFAULT_NCC_CONFIG = {
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

export const DEFAULT_BYTENODE_CONFIG = {
  extName: '.robot'
};

export const DEFAULT_ECOSYSTEM = {
  name: 'nico-app',
  script: './app.js',
  instances: '-1',
  exec_mode: 'cluster',
  max_memory_restart: '512M',
  max_restarts: 20,
  args: ['--color'],
  env: {
    NODE_ENV: "production"
  }
};

export const DEFAULT_APP_CONFIG = {};
