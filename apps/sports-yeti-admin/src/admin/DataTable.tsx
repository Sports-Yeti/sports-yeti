import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { Skeleton, Text } from '../ui';
import { EmptyState } from '../ui';

export interface DataTableColumn<Row> {
  id: string;
  header: string;
  accessor: (row: Row) => React.ReactNode;
  width?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  hint?: string;
}

interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onRowPress?: (row: Row) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
  rowsLoadingCount?: number;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon,
  onRowPress,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortKey,
  sortDir,
  onSort,
  style,
  rowsLoadingCount = 6,
}: DataTableProps<Row>) {
  const allSelected =
    selectable && selectedIds && rows.length > 0
      ? rows.every((r) => selectedIds.has(rowKey(r)))
      : false;

  return (
    <View style={[styles.wrap, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {selectable ? (
              <Pressable
                onPress={onToggleSelectAll}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: allSelected }}
                accessibilityLabel="Select all rows"
                style={[styles.cell, styles.checkboxCell]}
              >
                <View
                  style={[
                    styles.checkbox,
                    allSelected ? styles.checkboxChecked : null,
                  ]}
                />
              </Pressable>
            ) : null}
            {columns.map((col) => {
              const isSorted = col.sortable && sortKey === col.id;
              return (
                <Pressable
                  key={col.id}
                  onPress={() =>
                    col.sortable && onSort ? onSort(col.id) : undefined
                  }
                  accessibilityRole={col.sortable ? 'button' : undefined}
                  accessibilityLabel={
                    col.sortable
                      ? `Sort by ${col.header}, ${isSorted ? `currently ${sortDir}ending` : 'unsorted'}`
                      : col.header
                  }
                  style={[
                    styles.cell,
                    styles.headerCell,
                    {
                      width: col.width ?? 160,
                      justifyContent:
                        col.align === 'right'
                          ? 'flex-end'
                          : col.align === 'center'
                          ? 'center'
                          : 'flex-start',
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={
                      isSorted ? colors.text.primary : colors.text.secondary
                    }
                    weight="600"
                  >
                    {col.header}
                  </Text>
                  {col.sortable ? (
                    isSorted ? (
                      sortDir === 'asc' ? (
                        <ChevronUp
                          size={10}
                          color={colors.text.primary}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <ChevronDown
                          size={10}
                          color={colors.text.primary}
                          strokeWidth={2.5}
                        />
                      )
                    ) : (
                      <ChevronDown
                        size={10}
                        color={colors.text.muted}
                        strokeWidth={2.25}
                      />
                    )
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.loadingBlock}>
              {Array.from({ length: rowsLoadingCount }).map((_, i) => (
                <View key={i} style={styles.loadingRow}>
                  <Skeleton width="100%" height={16} />
                </View>
              ))}
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.emptyBlock}>
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={emptyIcon}
              />
            </View>
          ) : (
            rows.map((row) => {
              const id = rowKey(row);
              const isSelected = selectedIds?.has(id) ?? false;
              return (
                <Pressable
                  key={id}
                  onPress={onRowPress ? () => onRowPress(row) : undefined}
                  accessibilityRole={onRowPress ? 'button' : undefined}
                  style={({ hovered }) => [
                    styles.bodyRow,
                    isSelected ? styles.bodyRowSelected : null,
                    // @ts-expect-error rn-web hovered
                    hovered && onRowPress ? styles.bodyRowHover : null,
                  ]}
                >
                  {selectable ? (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(id);
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel="Select row"
                      style={[styles.cell, styles.checkboxCell]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected ? styles.checkboxChecked : null,
                        ]}
                      />
                    </Pressable>
                  ) : null}
                  {columns.map((col) => (
                    <View
                      key={col.id}
                      style={[
                        styles.cell,
                        {
                          width: col.width ?? 160,
                          justifyContent:
                            col.align === 'right'
                              ? 'flex-end'
                              : col.align === 'center'
                              ? 'center'
                              : 'flex-start',
                        },
                      ]}
                    >
                      {col.accessor(row)}
                    </View>
                  ))}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    overflow: 'hidden',
    ...shadows.soft,
  },
  table: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
    height: 40,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  bodyRowHover: {
    backgroundColor: colors.surface.bg,
  },
  bodyRowSelected: {
    backgroundColor: colors.brand.soft,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  headerCell: {
    height: 40,
  },
  checkboxCell: {
    width: 44,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  loadingBlock: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  loadingRow: {
    minHeight: 36,
    justifyContent: 'center',
  },
  emptyBlock: {
    paddingVertical: spacing.xl,
  },
});
