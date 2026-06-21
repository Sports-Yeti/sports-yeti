import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type WebPressableState } from '../lib/pressable';
import { Check, Plus } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import { Drawer, Text, useToast } from '../ui';
import { ADMIN_ORG_SWITCHER, CURRENT_ORG } from '../mocks/org';

interface OrgSwitcherProps {
  visible: boolean;
  onRequestClose: () => void;
}

export function OrgSwitcher({ visible, onRequestClose }: OrgSwitcherProps) {
  const toast = useToast();
  const [activeId, setActiveId] = useState(CURRENT_ORG.id);

  return (
    <Drawer
      visible={visible}
      onRequestClose={onRequestClose}
      title="Switch organization"
      width={400}
    >
      <View style={styles.list}>
        {ADMIN_ORG_SWITCHER.map((org) => {
          const active = org.id === activeId;
          return (
            <Pressable
              key={org.id}
              onPress={() => {
                setActiveId(org.id);
                onRequestClose();
                if (org.id !== CURRENT_ORG.id) {
                  toast.show({
                    variant: 'info',
                    title: `Org switching coming soon`,
                    description: `Mocked switch to ${org.name}.`,
                  });
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${org.name}`}
              accessibilityState={{ selected: active }}
              style={({ hovered }: WebPressableState) => [
                styles.item,
                active ? styles.itemActive : null,
                hovered ? styles.itemHover : null,
              ]}
            >
              <View style={styles.itemBody}>
                <Text variant="h4" color={colors.text.primary}>
                  {org.name}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {org.city} · {org.plan} plan
                </Text>
              </View>
              {active ? (
                <Check size={14} color={colors.brand.primary} strokeWidth={2.5} />
              ) : null}
            </Pressable>
          );
        })}

        <Pressable
          onPress={() =>
            toast.show({ variant: 'info', title: 'Create org coming soon' })
          }
          accessibilityRole="button"
          accessibilityLabel="Create new organization"
          style={({ hovered }: WebPressableState) => [
            styles.createBtn,
            hovered ? styles.createBtnHover : null,
          ]}
        >
          <Plus size={14} color={colors.brand.primary} strokeWidth={2.5} />
          <Text variant="button" color={colors.brand.primary}>
            Create new organization
          </Text>
        </Pressable>
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    backgroundColor: colors.surface.card,
  },
  itemActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
  },
  itemHover: {
    borderColor: colors.border.strong,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.strong,
    justifyContent: 'center',
  },
  createBtnHover: {
    backgroundColor: colors.brand.soft,
  },
});
