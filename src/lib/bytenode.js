'use strict';

const fs = require('fs');
const vm = require('vm');
const v8 = require('v8');
const path = require('path');
const Module = require('module');

v8.setFlagsFromString('--no-lazy');

if (Number.parseInt(process.versions.node.split('.')[0], 10) >= 12) {
  v8.setFlagsFromString('--no-flush-bytecode');
}

class ByteNode {
  static config = {
    extName: '.robot'
  };

  static init(config) {
    this.config = {
      ...this.config,
      ...config
    };

    Module._extensions[this.config.extName] = (module, filename) => {
      let bytecodeBuffer = fs.readFileSync(filename);

      this.fixBytecode(bytecodeBuffer);

      let length = this.readSourceHash(bytecodeBuffer);

      let dummyCode = '';

      if (length > 1) {
        dummyCode = '"' + '\u200b'.repeat(length - 2) + '"';
      }

      let script = new vm.Script(dummyCode, {
        filename: filename,
        lineOffset: 0,
        displayErrors: true,
        cachedData: bytecodeBuffer
      });

      if (script.cachedDataRejected) {
        throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
      }

      function require(id) {
        return module.require(id);
      }
      require.resolve = function (request, options) {
        return Module._resolveFilename(request, module, false, options);
      };
      require.main = process.mainModule;

      require.extensions = Module._extensions;
      require.cache = Module._cache;

      let compiledWrapper = script.runInThisContext({
        filename: filename,
        lineOffset: 0,
        columnOffset: 0,
        displayErrors: true
      });

      let dirname = path.dirname(filename);

      let args = [module.exports, require, module, filename, dirname, process, global];

      return compiledWrapper.apply(module.exports, args);
    };
  }

  static compileCode(javascriptCode) {
    if (typeof javascriptCode !== 'string') {
      throw new Error(`javascriptCode must be string. ${typeof javascriptCode} was given.`);
    }

    let script = new vm.Script(javascriptCode, {
      produceCachedData: true
    });

    let bytecodeBuffer = script.createCachedData && script.createCachedData.call ? script.createCachedData() : script.cachedData;

    return bytecodeBuffer;
  }

  static fixBytecode(bytecodeBuffer) {
    if (!Buffer.isBuffer(bytecodeBuffer)) {
      throw new Error(`bytecodeBuffer must be a buffer object.`);
    }

    let dummyBytecode = this.compileCode('"ಠ_ಠ"');

    if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) {
      dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
      dummyBytecode.slice(20, 24).copy(bytecodeBuffer, 20);
    } else if (process.version.startsWith('v12') || process.version.startsWith('v13')) {
      dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
    } else {
      dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
      dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
    }
  }

  static readSourceHash(bytecodeBuffer) {
    if (!Buffer.isBuffer(bytecodeBuffer)) {
      throw new Error(`bytecodeBuffer must be a buffer object.`);
    }

    if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) {
      return bytecodeBuffer.slice(12, 16).reduce((sum, number, power) => (sum += number * Math.pow(256, power)), 0);
    } else {
      return bytecodeBuffer.slice(8, 12).reduce((sum, number, power) => (sum += number * Math.pow(256, power)), 0);
    }
  }

  static runBytecode(bytecodeBuffer) {
    if (!Buffer.isBuffer(bytecodeBuffer)) {
      throw new Error(`bytecodeBuffer must be a buffer object.`);
    }

    this.fixBytecode(bytecodeBuffer);

    let length = this.readSourceHash(bytecodeBuffer);

    let dummyCode = '';

    if (length > 1) {
      dummyCode = '"' + '\u200b'.repeat(length - 2) + '"';
    }

    let script = new vm.Script(dummyCode, {
      cachedData: bytecodeBuffer
    });

    if (script.cachedDataRejected) {
      throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
    }

    return script.runInThisContext();
  }

  static compileFile(args, output) {
    let filename, compileAsModule;

    if (typeof args === 'string') {
      filename = args;
      compileAsModule = true;
    } else if (typeof args === 'object') {
      filename = args.filename;
      compileAsModule = args.compileAsModule !== false;
    }

    if (typeof filename !== 'string') {
      throw new Error(`filename must be a string. ${typeof filename} was given.`);
    }

    let compiledFilename = args.output || output || filename.slice(0, -3) + this.config.extName;

    if (typeof compiledFilename !== 'string') {
      throw new Error(`output must be a string. ${typeof compiledFilename} was given.`);
    }

    let javascriptCode = fs.readFileSync(filename, 'utf-8');

    let bytecodeBuffer;

    if (compileAsModule) {
      bytecodeBuffer = this.compileCode(Module.wrap(javascriptCode.replace(/^#!.*/, '')));
    } else {
      bytecodeBuffer = this.compileCode(javascriptCode.replace(/^#!.*/, ''));
    }

    fs.writeFileSync(compiledFilename, bytecodeBuffer);

    return compiledFilename;
  }

  static runBytecodeFile(filename) {
    if (typeof filename !== 'string') {
      throw new Error(`filename must be a string. ${typeof filename} was given.`);
    }

    let bytecodeBuffer = fs.readFileSync(filename);

    return this.runBytecode(bytecodeBuffer);
  }
}

ByteNode.init();

module.exports = ByteNode;
