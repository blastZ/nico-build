import path from 'path';
import shell from 'shelljs';

import { Config } from './config';
import ncc from './ncc';
import pkg from './pkg';
import template from './template';
import bytenode from './bytenode';

export default async function build(series: Config[]) {
  if (!Array.isArray(series)) {
    throw new Error('Series must be provided');
  }

  console.log(series.map((o) => o.type));

  for (let task of series) {
    if (!task.type) {
      throw new Error('Task type must be provided');
    }

    const input = task.input;
    const output = task.output;
    const origin = path.resolve(input);
    const dist = path.resolve(output);

    if (task.type !== 'template' && !shell.test('-f', origin)) {
      throw new Error(`Input file ${origin} not found`);
    }

    if (task.rmOutput) {
      shell.rm('-rf', dist);
    }

    if (!shell.test('-d', dist)) {
      shell.mkdir('-p', dist);
    }

    const fixed = { input: origin, output: dist };

    if (task.type === 'ncc') {
      await ncc({ ...task, ...fixed });
    } else if (task.type === 'bytenode') {
      await bytenode({ ...task, ...fixed });
    } else if (task.type === 'template') {
      await template({ ...task, ...fixed });
    } else if (task.type === 'pkg') {
      await pkg({ ...task, ...fixed });
    }
  }
}
