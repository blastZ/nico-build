import { promises as fs } from 'fs';
import path from 'path';
import { deepmerge } from '@blastz/nico-utility';
import { CommonConfig } from './config';

export interface Config extends CommonConfig {
  type: 'template';
  ecosystem?: PM2StartOptions;
}

export default async function template(config: Config) {
  const { input, output } = config;

  if (config?.ecosystem) {
    _createEcosystemFile(output, deepmerge(DEFAULT_TEMPLATE_ECOSYSTEM, typeof config.ecosystem === 'object' ? config.ecosystem : {}));
  }
}

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

const _createEcosystemFile = async (output: string, content: Object) => {
  let ecosystemConfig = `module.exports = {\n` + `  apps: [\n` + `    {\n`;
  ecosystemConfig = _appendObj(ecosystemConfig, content || {}, 6);
  ecosystemConfig += `    }\n` + `  ]\n` + `};`;

  await fs.writeFile(path.resolve(output, './ecosystem.config.js'), ecosystemConfig);
};

const DEFAULT_TEMPLATE_ECOSYSTEM = {
  name: 'nico-app',
  script: './app',
  instances: '-1',
  exec_mode: 'cluster',
  max_memory_restart: '512M',
  max_restarts: 20,
  args: ['--color'],
  env: {
    NODE_ENV: 'production'
  }
};

export type PM2StartOptions = {
  name?: string;
  script?: string;
  args?: string | string[];
  interpreter_args?: string | string[];
  cwd?: string;
  out_file?: string;
  error_file?: string;
  log_date_format?: string;
  pid_file?: string;
  min_uptime?: number;
  max_restarts?: number;
  max_memory_restart?: number | string;
  wait_ready?: boolean;
  kill_timeout?: number;
  restart_delay?: number;
  interpreter?: string;
  exec_mode?: string;
  instances?: number | string;
  merge_logs?: boolean;
  watch?: boolean | string[];
  force?: boolean;
  ignore_watch?: string[];
  cron?: any;
  execute_command?: any;
  write?: any;
  source_map_support?: any;
  disable_source_map_support?: any;
  env?: { [key: string]: string };
};
