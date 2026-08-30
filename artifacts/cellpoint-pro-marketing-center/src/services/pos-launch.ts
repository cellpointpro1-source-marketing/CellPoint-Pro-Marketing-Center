export const DEMO_STORE_ID = 'demo';

export type PosLaunchStoreContext = {
  storeId: string;
  userId?: string;
  userName?: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  storeWebsite: string;
  storeLogo: string;
  isDemoStore: boolean;
};

export type PosLaunchResolution =
  | { kind: 'demo'; context: PosLaunchStoreContext }
  | { kind: 'error'; code: 'missing-store-id' | 'invalid-store-id' };

const demoStore: PosLaunchStoreContext = {
  storeId: DEMO_STORE_ID,
  storeName: 'Riverbend Wireless',
  storePhone: '(319) 555-0148',
  storeAddress: '482 Market Street, Cedar Falls, IA 50613',
  storeWebsite: 'riverbendwireless.com',
  storeLogo: '/brand/cellpoint-pro-logo.png',
  isDemoStore: true,
};

/**
 * Resolves the temporary POS browser launch entry point.
 *
 * A store ID in a URL is routing context only. It must never be treated as
 * authentication or authorization, and this resolver intentionally accepts
 * only the seeded demo store during the development phase.
 */
export function resolvePosLaunch(search: string): PosLaunchResolution {
  const params = new URLSearchParams(search);
  const storeId = params.get('storeId')?.trim();

  if (!storeId) {
    return { kind: 'error', code: 'missing-store-id' };
  }

  if (storeId !== DEMO_STORE_ID) {
    return { kind: 'error', code: 'invalid-store-id' };
  }

  return { kind: 'demo', context: demoStore };
}

export function getPosLaunchErrorCopy(code: 'missing-store-id' | 'invalid-store-id') {
  return code === 'missing-store-id'
    ? {
        title: 'A store ID is required',
        description: 'This POS launch link is missing the store information needed to open a workspace.',
      }
    : {
        title: 'We could not find that store',
        description: 'The store in this launch link is not available in the current development environment.',
      };
}