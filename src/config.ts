import { Config as PkgConfig } from './pkg';
import { Config as TemplateConfig } from './template';
import { Config as BytenodeConfig } from './bytenode';
import { Config as NccConfig } from './ncc';

export interface CommonConfig {
  type: 'ncc' | 'pkg' | 'template' | 'bytenode';
  input: string;
  output: string;
  rmOutput?: boolean;
  rmInput?: boolean;
}

export type Config = NccConfig | BytenodeConfig | TemplateConfig | PkgConfig;
