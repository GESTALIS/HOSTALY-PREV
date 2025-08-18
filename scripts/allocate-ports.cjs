/* eslint-disable */
const fs = require('fs');
const path = require('path');
const detect = require('detect-port');

async function findFreePort(start) {
  let port = start;
  // increment until a free port is found
  // guard upper bound to avoid infinite loops
  for (let i = 0; i < 200; i++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await detect(port);
    if (free === port) return port;
    port += 1;
  }
  throw new Error(`Aucun port libre trouvé à partir de ${start}`);
}

async function main() {
  const defaults = {
    API: 3002,
    FRONT: 5174,
    DB: 5434,
    PGADMIN: 5050,
  };

  const apiPort = await findFreePort(defaults.API);
  const frontPort = await findFreePort(defaults.FRONT);
  const dbPort = await findFreePort(defaults.DB);
  const pgAdminPort = await findFreePort(defaults.PGADMIN);

  const rootEnvPorts = `API_PORT=${apiPort}\nFRONTEND_PORT=${frontPort}\nPOSTGRES_PORT=${dbPort}\nPGADMIN_PORT=${pgAdminPort}\n`;
  const rootEnvPortsPath = path.join(process.cwd(), '.env.ports');
  fs.writeFileSync(rootEnvPortsPath, rootEnvPorts, 'utf8');

  // backend .env
  const backendDir = path.join(process.cwd(), 'backend');
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });
  const backendEnvPath = path.join(backendDir, '.env');
  const backendEnv = [
    `PORT=${apiPort}`,
    `DATABASE_URL=postgresql://postgres:postgres@localhost:${dbPort}/hotaly_prev?schema=public`,
    `JWT_SECRET=${process.env.JWT_SECRET || 'dev-secret-change-me'}`,
    `CORS_ORIGIN=http://localhost:${frontPort}`,
    `RATE_LIMIT_WINDOW_MS=60000`,
    `RATE_LIMIT_MAX=100`,
  ].join('\n') + '\n';
  fs.writeFileSync(backendEnvPath, backendEnv, 'utf8');

  // frontend .env
  const frontendDir = path.join(process.cwd(), 'frontend');
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });
  const frontendEnvPath = path.join(frontendDir, '.env');
  const frontendEnv = [
    `PORT=${frontPort}`,
    `VITE_API_URL=http://localhost:${apiPort}/api/v1`,
  ].join('\n') + '\n';
  fs.writeFileSync(frontendEnvPath, frontendEnv, 'utf8');

  // Console output
  // Expected: Ports retenus → API:X FRONT:Y DB:Z PGADMIN:W
  // eslint-disable-next-line no-console
  console.log(`Ports retenus → API:${apiPort} FRONT:${frontPort} DB:${dbPort} PGADMIN:${pgAdminPort}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


