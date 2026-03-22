import { describe, expect, it } from 'vitest';
import {
  getTenantScopeColumn,
  getTenantScopeId,
  type BusinessContext,
} from '@/lib/supabase/business';

describe('getTenantScopeColumn', () => {
  it('returns "user_id" when usesLegacyUserScope is true', () => {
    const context = {
      usesLegacyUserScope: true,
    } as BusinessContext;
    expect(getTenantScopeColumn(context)).toBe('user_id');
  });

  it('returns "business_id" when usesLegacyUserScope is false', () => {
    const context = {
      usesLegacyUserScope: false,
    } as BusinessContext;
    expect(getTenantScopeColumn(context)).toBe('business_id');
  });
});

describe('getTenantScopeId', () => {
  it('returns context.userId when usesLegacyUserScope is true', () => {
    const context = {
      usesLegacyUserScope: true,
      userId: 'test-user-id',
      businessId: 'test-business-id',
    } as BusinessContext;
    expect(getTenantScopeId(context)).toBe('test-user-id');
  });

  it('returns context.businessId when usesLegacyUserScope is false', () => {
    const context = {
      usesLegacyUserScope: false,
      userId: 'test-user-id',
      businessId: 'test-business-id',
    } as BusinessContext;
    expect(getTenantScopeId(context)).toBe('test-business-id');
  });
});
