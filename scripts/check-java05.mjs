// Runs the official static checker against local planned files, without a push.
// Download the official checker separately and pass its path as argument 1.
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

async function run() {
  if (!process.argv[2]) throw new Error('Missing official checker path');
  const { checkFiles } = createRequire(import.meta.url)(resolve(process.argv[2]));
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', '.', ':(exclude)detyrapm/**', ':(exclude)skica.png'], { encoding: 'utf8' })
    .trim().split(/\r?\n/).filter(Boolean);
  const github = { rest: {
    repos: {
      get: async () => ({ data: { private: false, default_branch: 'main' } }),
      getBranch: async () => ({ data: { commit: { sha: 'local-worktree', commit: { tree: { sha: 'local-tree' } } } } }),
      getContent: async ({ path }) => ({ data: path ? {
        encoding: 'base64', content: readFileSync(path).toString('base64'),
      } : paths.filter(p => !p.includes('/')).map(p => ({ type: 'file', name: p, path: p, size: statSync(p).size })) }),
    },
    git: { getTree: async () => ({ data: { truncated: false, tree: paths.map(path => ({ type: 'blob', path })) } }) },
  } };
  const { checks } = await checkFiles({ owner: 'local', repo: 'local', week: 5 }, github);
  console.log('LOCAL official-checker simulation; remote visibility and pushed files are not checked.');
  for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'}: ${check.message}`);
  console.log(`${checks.filter(c => c.ok).length}/${checks.length}`);
  if (checks.some(c => !c.ok)) process.exitCode = 1;
}
run().catch(() => {
  console.error('FAIL: local checker. Pass the downloaded official check-mobile-submission.cjs path.');
  process.exitCode = 1;
});
