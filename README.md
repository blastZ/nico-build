# nico-build

Use [ncc]() and [bytenode]() to compile nico project.

## Installation

```bash
$ npm install -D @blastz/nico-build
```

## Usage

```ts
import path from 'path';
import build from '@blastz/nico-build';

build([
  {
    type: 'ncc',
    input: path.resolve(__dirname, './index.js'),
    output: path.resolve(__dirname, './dist'),
    rmOutput: true
  }
]);
```
