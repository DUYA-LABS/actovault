import { randomUUID } from 'node:crypto';

export const SCHEMA_VERSION = '0.1-draft' as const;
export const POLICY = Object.freeze({ id: 'tenant-record-access', version: '1' });

export type TrustedContext = Readonly<{ principalId: string; tenantId: string }>;
export type ToolRequest =
  | Readonly<{ tool: 'record.read'; parameters: Readonly<{ recordId: string }> }>
  | Readonly<{ tool: 'record.update'; parameters: Readonly<{ recordId: string; value: string }> }>;
export type Action = Readonly<{
  schemaVersion: typeof SCHEMA_VERSION;
  actionId: string;
  principalId: string;
  tenantId: string;
  tool: ToolRequest['tool'];
  parameters: ToolRequest['parameters'];
  resourceTenantId: string;
  policyVersion: string;
}>;
export type ReasonCode =
  | 'SAME_TENANT' | 'ACCESS_DENIED' | 'INVALID_CONTEXT'
  | 'INVALID_REQUEST' | 'UNKNOWN_TOOL' | 'OWNERSHIP_UNAVAILABLE'
  | 'EVALUATION_ERROR' | 'INVALID_ACTION';
export type Decision = Readonly<{
  actionId: string;
  policyId: string;
  policyVersion: string;
  outcome: 'allow' | 'deny';
  reasonCode: ReasonCode;
  status: 'evaluated' | 'error';
  evaluatedAt: string;
}>;
export type Assessment = Readonly<{ decision: Decision; action?: Action }>;
export type OwnershipResolver = (recordId: string, context: TrustedContext) => Promise<unknown>;

// This API accepts parsed JSON-like data, not hostile executable JS objects.
function object(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Reflect.ownKeys(value);
  return actual.length === keys.length && actual.every(key =>
    typeof key === 'string' && keys.includes(key)
    && Object.getOwnPropertyDescriptor(value, key)?.get === undefined
    && Object.getOwnPropertyDescriptor(value, key)?.set === undefined);
}

function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
}

function context(value: unknown): TrustedContext | undefined {
  if (!object(value) || !exactKeys(value, ['principalId', 'tenantId'])
    || !identifier(value.principalId) || !identifier(value.tenantId)) return;
  return Object.freeze({ principalId: value.principalId, tenantId: value.tenantId });
}

function request(value: unknown): ToolRequest | undefined {
  if (!object(value) || !exactKeys(value, ['tool', 'parameters']) || !object(value.parameters)) return;
  const p = value.parameters;
  if (value.tool === 'record.read' && exactKeys(p, ['recordId']) && identifier(p.recordId)) {
    return Object.freeze({ tool: value.tool, parameters: Object.freeze({ recordId: p.recordId }) });
  }
  if (value.tool === 'record.update' && exactKeys(p, ['recordId', 'value'])
    && identifier(p.recordId) && typeof p.value === 'string' && p.value.length <= 4096) {
    return Object.freeze({
      tool: value.tool, parameters: Object.freeze({ recordId: p.recordId, value: p.value }),
    });
  }
}

function decision(actionId: string, reasonCode: ReasonCode, status: Decision['status'] = 'evaluated'): Decision {
  return Object.freeze({
    actionId, policyId: POLICY.id, policyVersion: POLICY.version,
    outcome: reasonCode === 'SAME_TENANT' ? 'allow' : 'deny',
    reasonCode, status, evaluatedAt: new Date().toISOString(),
  });
}

/** Evaluate a trusted assembled action. This does not authenticate or execute it. */
export function evaluateTenantPolicy(input: unknown): Decision {
  const fallbackId = randomUUID();
  try {
    if (!object(input) || !exactKeys(input, [
      'schemaVersion', 'actionId', 'principalId', 'tenantId', 'tool',
      'parameters', 'resourceTenantId', 'policyVersion',
    ])) return decision(fallbackId, 'INVALID_ACTION');
    if (input.schemaVersion !== SCHEMA_VERSION || input.policyVersion !== POLICY.version
      || !identifier(input.actionId) || !identifier(input.resourceTenantId)
      || !context({ principalId: input.principalId, tenantId: input.tenantId })
      || !request({ tool: input.tool, parameters: input.parameters })) {
      return decision(fallbackId, 'INVALID_ACTION');
    }
    return decision(input.actionId,
      input.tenantId === input.resourceTenantId ? 'SAME_TENANT' : 'ACCESS_DENIED');
  } catch {
    return decision(fallbackId, 'EVALUATION_ERROR', 'error');
  }
}

/**
 * Build and assess an action from trusted host context and untrusted tool JSON.
 * The host must authenticate context and supply a trusted ownership resolver.
 * Any caller can construct context in process: this function is not authentication.
 * No action or record values are included in denied/error assessments.
 */
export async function assessAction(
  authenticatedContext: unknown,
  toolRequest: unknown,
  resolveOwnership: OwnershipResolver,
): Promise<Assessment> {
  const actionId = randomUUID();
  try {
    const caller = context(authenticatedContext);
    if (!caller) return Object.freeze({ decision: decision(actionId, 'INVALID_CONTEXT') });
    // Snapshot and freeze before awaiting adapter work to prevent argument mutation.
    const normalized = request(toolRequest);
    if (!normalized) {
      const unknownTool = object(toolRequest)
        && Object.getOwnPropertyDescriptor(toolRequest, 'tool')?.value !== undefined
        && !['record.read', 'record.update'].includes(Object.getOwnPropertyDescriptor(toolRequest, 'tool')?.value);
      return Object.freeze({ decision: decision(actionId, unknownTool ? 'UNKNOWN_TOOL' : 'INVALID_REQUEST') });
    }
    const owner = await resolveOwnership(normalized.parameters.recordId, caller);
    if (!identifier(owner)) {
      return Object.freeze({ decision: decision(actionId, 'OWNERSHIP_UNAVAILABLE', 'error') });
    }
    const action: Action = Object.freeze({
      schemaVersion: SCHEMA_VERSION, actionId, principalId: caller.principalId,
      tenantId: caller.tenantId, tool: normalized.tool, parameters: normalized.parameters,
      resourceTenantId: owner, policyVersion: POLICY.version,
    });
    const result = evaluateTenantPolicy(action);
    return Object.freeze(result.outcome === 'allow' ? { decision: result, action } : { decision: result });
  } catch {
    // Do not expose adapter exception messages, record IDs, or values in evidence.
    return Object.freeze({ decision: decision(actionId, 'EVALUATION_ERROR', 'error') });
  }
}
