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

build(path.resolve(__dirname, './index.js'), path.resolve(__dirname, './dist')).catch((err) => {
  console.log(err);
});
```
