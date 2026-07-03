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
  ROLE_SORT_ORDER,
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
  /** Activate a new role for this session (RolesScreen "Activate"). */
  addRole: (role: Role) => void;
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

  // Roles activated during this session (RolesScreen "Activate" flow) —
  // merged with the seeded stack so the switcher offers them immediately.
  const [sessionRoles, setSessionRoles] = useState<RoleAssignment[]>([]);

  const roles = useMemo(
    () =>
      [...sortedRoles(stack), ...sessionRoles].sort(
        (a, b) => ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role],
      ),
    [stack, sessionRoles],
  );

  // Track the active role by identity (role + scope), not array index —
  // session-activated roles re-sort the list and would shift indexes.
  const roleKey = (r: Pick<RoleAssignment, 'role' | 'scopeId'>) =>
    `${r.role}:${r.scopeId ?? 'global'}`;

  const [activeKey, setActiveKey] = useState(() =>
    roleKey(primaryRole(stack)),
  );

  const activeRole =
    roles.find((r) => roleKey(r) === activeKey) ?? roles[0];

  const setActiveRoleByIndex = useCallback(
    (index: number) => {
      const next = roles[index];
      if (next) setActiveKey(roleKey(next));
    },
    [roles],
  );

  const setActiveRole = useCallback(
    (role: Role, scopeId?: string) => {
      const next = roles.find(
        (r) => r.role === role && (!scopeId || r.scopeId === scopeId),
      );
      if (next) setActiveKey(roleKey(next));
    },
    [roles],
  );

  const addRole = useCallback((role: Role) => {
    setSessionRoles((prev) => {
      if (prev.some((r) => r.role === role)) return prev;
      return [
        ...prev,
        { role, activatedAtIso: new Date().toISOString() },
      ];
    });
  }, []);

  const hasRole = useCallback(
    (role: Role, scopeId?: string) =>
      hasRoleFn(stack, role, scopeId) ||
      sessionRoles.some(
        (r) => r.role === role && (!scopeId || r.scopeId === scopeId),
      ),
    [stack, sessionRoles],
  );

  const value = useMemo<RoleStackContextValue>(
    () => ({
      stack,
      roles,
      activeRole,
      setActiveRoleByIndex,
      setActiveRole,
      addRole,
      hasRole,
      labels: ROLE_LABEL,
      descriptions: ROLE_DESCRIPTION,
    }),
    [
      stack,
      roles,
      activeRole,
      setActiveRoleByIndex,
      setActiveRole,
      addRole,
      hasRole,
    ],
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
