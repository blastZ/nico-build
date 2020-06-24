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
  name: 'app-name',
  script: './app.js',
  instances: '-1',
  exec_mode: 'cluster',
  max_memory_restart: '512M',
  out_file: './log/out.log',
  error_file: './log/error.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  env: {
    PORT: '1314',
    DEBUG_COLORS: true,
    DEBUG: 'nico:err',
    NODE_ENV: 'production',
    APP_ENV: 'production'
  }
};

export const DEFAULT_APP_CONFIG = {
  production: {}
};
