type NccConfig = {
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

type BytenodeConfig = {
  extName: string;
}
  

type AppConfig = {
  [key: string]: any;
};

type Config = {
  series?: ('ncc' | 'bytenode')[];
  rmDist?: boolean;
  outputName?: string;
  ncc?: NccConfig;
  bytenode?: BytenodeConfig;
  ecosystem?: PM2.StartOptions;
  appConfig?: AppConfig;
};
