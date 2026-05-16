import { execSync } from 'child_process';
try {
  console.log('Running migration wrapper...');
  // process will exit on its own when done, or after timeout
  execSync('npx tsx migrate_data_smart.ts', { stdio: 'inherit', timeout: 240000 });
} catch(e: any) {
  if (e.code === 'ETIMEDOUT') {
    console.log('Wrapper: timed out after 4 minutes');
  } else {
    console.log('Wrapper: exit with code', e.status);
  }
}
process.exit(0);
