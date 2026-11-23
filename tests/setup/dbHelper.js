import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { obtenerConfigPruebas } from './testDbConfig.js';

const BACK_ROOT = fileURLToPath(new URL('../../', import.meta.url));

async function resetDatabase() {
  const config = obtenerConfigPruebas();
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DB_NAME_TEST: config.database,
  };

  execFileSync('npx', ['prisma', 'migrate', 'reset', '--force'], {
    cwd: BACK_ROOT,
    env,
    stdio: 'inherit',
  });
  execFileSync('npx', ['prisma', 'db', 'seed'], {
    cwd: BACK_ROOT,
    env,
    stdio: 'inherit',
  });
}

export { resetDatabase };
export default { resetDatabase };
