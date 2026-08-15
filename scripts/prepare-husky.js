// Skip Husky install on Vercel (or other CI) to avoid deployment failures
const isVercel = !!process.env.VERCEL || !!process.env.CI;

if (isVercel) {
  console.log('Skipping husky install on CI/Vercel.');
  process.exit(0);
}

async function prepareHusky() {
  try {
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync('npx', ['husky', 'install'], {
      stdio: 'inherit',
    });

    process.exit(result.status ?? 0);
  } catch {
    console.error('Husky install failed or Husky not present. Skipping.');
    process.exit(0);
  }
}

void prepareHusky();
