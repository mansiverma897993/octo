import test from 'node:test';
import assert from 'node:assert/strict';
import { enforcePolicy } from '../src/commands/policy.js';

test('enforcePolicy blocks unauthorized role', () => {
  assert.throws(() => enforcePolicy({ action: 'CREATE_NEXTJS_APP', requiresApproval: false }, { role: 'viewer' }));
});

test('enforcePolicy marks risky commands for approval', () => {
  const out = enforcePolicy({ action: 'CREATE_NEXTJS_APP', requiresApproval: false }, { role: 'admin' });
  assert.equal(out.requiresApproval, true);
});
