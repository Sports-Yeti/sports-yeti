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
  /** Full role stack for the active user. */
  stack: RoleStack;
  /** Sorted role list (player → captain → ref → fm → la → oa). */
  roles: RoleAssignment[];
  /** Currently active role — drives nav surface. */
  activeRole: RoleAssignment;
  /** Switch to a specific role assignment by index in `roles`. */
  setActiveRoleByIndex: (index: number) => void;
  /** Switch by role name (first matching scope is picked). */
  setActiveRole: (role: Role, scopeId?: string) => void;
  /** Convenience predicate. */
  hasRole: (role: Role, scopeId?: string) => boolean;
  /** Static labels for surfacing in the role switcher / activation cards. */
  labels: typeof ROLE_LABEL;
  descriptions: typeof ROLE_DESCRIPTION;
}

const RoleStackContext = createContext<RoleStackContextValue | null>(null);

export interface RoleStackProviderProps {
  /** Optional override — defaults to the demo user. */
  userId?: string;
  children: React.ReactNode;
}

/**
 * Provides the active user's role stack + active-role state to the entire
 * mobile app tree. The Role Switcher (Phase 3) calls `setActiveRole` to
 * morph the bottom-tab navigator.
 *
 * Backed by `@sports-yeti/mocks` — when real auth lands, this provider
 * gets a `userId` from the auth store instead of the demo default.
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
    const primary = primaryRole(stack);
    const idx = roles.findIndex(
      (r) => r.role === primary.role && r.scopeId === primary.scopeId,
    );
    return idx === -1 ? 0 : idx;
  });

  const activeRole = roles[activeRoleIndex];

  const setActiveRoleByIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= roles.length) {
        return;
      }
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
