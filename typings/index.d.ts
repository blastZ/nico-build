type NccConfig =
  | {
      cache?: string | false;
      externals?: string[];
      filterAssetBase?: string;
      minify?: boolean;
      sourceMap?: boolean;
      sourceMapBasePrefix?: string;
      sourceMapRegister?: boolean;
      watch?: boolean;
      v8cache?: boolean;
      quiet?: boolean;
      debugLog?: boolean;
    }
  | false;

type BytenodeConfig =
  | {
      extName: string;
    }
  | false;

type AppConfig = {
  [key: string]: any;
};

type Config = {
  rmDist?: boolean;
  outputName?: string;
  ncc?: NccConfig;
  bytenode?: BytenodeConfig;
  ecosystem?: PM2.StartOptions;
  appConfig?: AppConfig;
};
