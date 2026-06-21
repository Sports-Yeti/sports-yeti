import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  DEMO_USER_ID,
  hasRole as hasRoleFn,
  primaryRole,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  roleStackForUser,
  sortedRoles,
  type Role,
  type RoleAssignment,
  type RoleStack,
} from '@sports-yeti/mocks';

export interface RoleStackContextValue {
  stack: RoleStack;
  roles: RoleAssignment[];
  activeRole: RoleAssignment;
  setActiveRoleByIndex: (index: number) => void;
  setActiveRole: (role: Role, scopeId?: string) => void;
  hasRole: (role: Role, scopeId?: string) => boolean;
  labels: typeof ROLE_LABEL;
  descriptions: typeof ROLE_DESCRIPTION;
}

const RoleStackContext = createContext<RoleStackContextValue | null>(null);

export interface RoleStackProviderProps {
  userId?: string;
  children: React.ReactNode;
}

/**
 * Admin-app variant of RoleStackProvider. Identical to the mobile
 * provider — kept per-app per the plan's hybrid principle (feature
 * compositions stay per-app; only the underlying types/fixtures are
 * shared via @sports-yeti/mocks).
 */
export function RoleStackProvider({
  userId = DEMO_USER_ID,
  children,
}: RoleStackProviderProps) {
  const stack = useMemo<RoleStack>(() => {
    const found = roleStackForUser(userId);
    if (!found) {
      throw new Error(
        `RoleStackProvider: no role stack found for user "${userId}". ` +
          'Add the user to @sports-yeti/mocks/role-stacks.ts.',
      );
    }
    return found;
  }, [userId]);

  const roles = useMemo(() => sortedRoles(stack), [stack]);

  const [activeRoleIndex, setActiveRoleIndex] = useState(() => {
    // Admin app boots into the highest-privilege admin role available
    // (org_admin > league_admin > facility_manager > captain > referee > player).
    const order: Role[] = [
      'org_admin',
      'league_admin',
      'facility_manager',
      'team_captain',
      'referee',
      'player',
    ];
    for (const target of order) {
      const idx = roles.findIndex((r) => r.role === target);
      if (idx !== -1) return idx;
    }
    const primary = primaryRole(stack);
    const idx = roles.findIndex(
      (r) => r.role === primary.role && r.scopeId === primary.scopeId,
    );
    return idx === -1 ? 0 : idx;
  });

  const activeRole = roles[activeRoleIndex];

  const setActiveRoleByIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= roles.length) return;
      setActiveRoleIndex(index);
    },
    [roles.length],
  );

  const setActiveRole = useCallback(
    (role: Role, scopeId?: string) => {
      const idx = roles.findIndex(
        (r) => r.role === role && (!scopeId || r.scopeId === scopeId),
      );
      if (idx !== -1) setActiveRoleIndex(idx);
    },
    [roles],
  );

  const hasRole = useCallback(
    (role: Role, scopeId?: string) => hasRoleFn(stack, role, scopeId),
    [stack],
  );

  const value = useMemo<RoleStackContextValue>(
    () => ({
      stack,
      roles,
      activeRole,
      setActiveRoleByIndex,
      setActiveRole,
      hasRole,
      labels: ROLE_LABEL,
      descriptions: ROLE_DESCRIPTION,
    }),
    [stack, roles, activeRole, setActiveRoleByIndex, setActiveRole, hasRole],
  );

  return (
    <RoleStackContext.Provider value={value}>
      {children}
    </RoleStackContext.Provider>
  );
}

export function useRoleStack(): RoleStackContextValue {
  const ctx = useContext(RoleStackContext);
  if (!ctx) {
    throw new Error(
      'useRoleStack() called outside of <RoleStackProvider>. ' +
        'Wrap your navigator tree with <RoleStackProvider>.',
    );
  }
  return ctx;
}
