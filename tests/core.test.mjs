import test from 'node:test';
import assert from 'node:assert/strict';
import { assessAction, evaluateTenantPolicy, POLICY } from '../packages/core/src/index.ts';

const caller = () => ({ principalId: 'user-a', tenantId: 'tenant-a' });
const read = () => ({ tool: 'record.read', parameters: { recordId: 'record-a' } });
const update = () => ({ tool: 'record.update', parameters: { recordId: 'record-a', value: 'new value' } });

test('same-tenant tools assemble a frozen, versioned action', async () => {
  for (const tool of [read(), update()]) {
    const result = await assessAction(caller(), tool, async (id, ctx) => {
      assert.equal(id, 'record-a');
      assert.deepEqual(ctx, caller());
      assert.ok(Object.isFrozen(ctx));
      return 'tenant-a';
    });
    assert.equal(result.decision.outcome, 'allow');
    assert.equal(result.decision.reasonCode, 'SAME_TENANT');
    assert.equal(result.action.policyVersion, POLICY.version);
    assert.equal(result.action.actionId, result.decision.actionId);
    assert.ok(Object.isFrozen(result.action.parameters));
    assert.ok(Object.isFrozen(result.action));
    assert.ok(Object.isFrozen(result.decision));
  }
});

test('cross-tenant denial omits resource ownership and submitted values', async () => {
  const req = update();
  req.parameters.value = 'SECRET';
  const result = await assessAction(caller(), req, async () => 'tenant-b');
  assert.equal(result.decision.outcome, 'deny');
  assert.equal(result.decision.reasonCode, 'ACCESS_DENIED');
  assert.equal(result.action, undefined);
  assert.ok(!JSON.stringify(result).includes('SECRET'));
  assert.ok(!JSON.stringify(result).includes('tenant-b'));
});

for (const invalid of [null, {}, { tenantId: 'tenant-a' }, { principalId: 'a' },
  { principalId: '', tenantId: 'tenant-a' }, { principalId: 'user-a', tenantId: 1 },
  { ...caller(), role: 'admin' }]) {
  test('invalid context is blocked before ownership lookup: ' + JSON.stringify(invalid), async () => {
    let calls = 0;
    const result = await assessAction(invalid, read(), async () => { calls++; return 'tenant-a'; });
    assert.equal(result.decision.reasonCode, 'INVALID_CONTEXT');
    assert.equal(result.decision.outcome, 'deny');
    assert.equal(calls, 0);
  });
}

for (const invalid of [null, {}, [], { tool: 'shell.exec', parameters: {} },
  { ...read(), tenantId: 'tenant-b' },
  { tool: 'record.read', parameters: { recordId: 'record-a', tenantId: 'tenant-b' } },
  { tool: 'record.read', parameters: { recordId: '../record-a' } },
  { tool: 'record.read', parameters: { recordId: 1 } },
  { tool: 'record.update', parameters: { recordId: 'record-a' } },
  { tool: 'record.update', parameters: { recordId: 'record-a', value: 'x'.repeat(4097) } }]) {
  test('invalid request never invokes adapter: ' + JSON.stringify(invalid).slice(0, 120), async () => {
    let calls = 0;
    const result = await assessAction(caller(), invalid, async () => { calls++; return 'tenant-a'; });
    assert.equal(result.decision.outcome, 'deny');
    assert.equal(result.action, undefined);
    assert.equal(calls, 0);
  });
}

test('null, malformed and unavailable ownership fail closed', async () => {
  for (const owner of [null, undefined, '', {}, ['tenant-a'], 'tenant a']) {
    const result = await assessAction(caller(), read(), async () => owner);
    assert.equal(result.decision.outcome, 'deny');
    assert.equal(result.decision.reasonCode, 'OWNERSHIP_UNAVAILABLE');
    assert.equal(result.decision.status, 'error');
  }
});

test('resolver exceptions are errors, not allows, and do not leak messages', async () => {
  const result = await assessAction(caller(), read(), async () => { throw Error('PRIVATE DATABASE TOKEN'); });
  assert.equal(result.decision.reasonCode, 'EVALUATION_ERROR');
  assert.equal(result.decision.status, 'error');
  assert.equal(result.decision.outcome, 'deny');
  assert.ok(!JSON.stringify(result).includes('PRIVATE'));
});

test('argument and caller mutation during ownership lookup cannot change assessed action', async () => {
  const ctx = caller();
  const req = update();
  const result = await assessAction(ctx, req, async () => {
    ctx.tenantId = 'tenant-b';
    req.parameters.recordId = 'record-b';
    req.parameters.value = 'changed';
    return 'tenant-a';
  });
  assert.equal(result.action.tenantId, 'tenant-a');
  assert.equal(result.action.parameters.recordId, 'record-a');
  assert.equal(result.action.parameters.value, 'new value');
});

test('direct policy input is validated and cannot override version or outcome', async () => {
  const { action } = await assessAction(caller(), read(), async () => 'tenant-a');
  for (const invalid of [
    { ...action, policyVersion: 'unknown' },
    { ...action, outcome: 'allow' },
    { ...action, principalId: '' },
    { ...action, tool: 'shell.exec' },
    { ...action, resourceTenantId: null },
  ]) assert.equal(evaluateTenantPolicy(invalid).outcome, 'deny');
  assert.equal(evaluateTenantPolicy({ ...action, resourceTenantId: 'tenant-b' }).outcome, 'deny');
});

test('accessor arguments are rejected without executing getters', async () => {
  let calls = 0;
  const req = { tool: 'record.read', get parameters() { calls++; throw Error('secret'); } };
  assert.equal((await assessAction(caller(), req, async () => 'tenant-a')).decision.outcome, 'deny');
  assert.equal(calls, 0);
});

test('assessments use distinct executor-generated action identifiers', async () => {
  const a = await assessAction(caller(), read(), async () => 'tenant-a');
  const b = await assessAction(caller(), read(), async () => 'tenant-a');
  assert.notEqual(a.decision.actionId, b.decision.actionId);
});
