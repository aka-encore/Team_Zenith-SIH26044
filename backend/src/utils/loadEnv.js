import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/** Load backend/.env from any ESM test script. */
export const loadEnv = (metaUrl) => {
  dotenv.config({ path: path.join(path.dirname(fileURLToPath(metaUrl)), '../../.env') });
};
