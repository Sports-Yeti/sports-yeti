import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import type { AuditLog } from '../types';

interface AuditDetailModalProps {
  visible: boolean;
  log: AuditLog | null;
  onClose: () => void;
}

function getEventColor(event: string): { bg: string; text: string } {
  switch (event) {
    case 'created':
      return { bg: COLORS.success + '20', text: COLORS.success };
    case 'updated':
      return { bg: COLORS.warning + '20', text: COLORS.warning };
    case 'deleted':
      return { bg: COLORS.error + '20', text: COLORS.error };
    default:
      return { bg: COLORS.textMuted + '20', text: COLORS.textMuted };
  }
}

function formatSubjectType(subjectType: string | null): string {
  if (!subjectType) return 'System';
  const parts = subjectType.split('\\');
  return parts[parts.length - 1];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

interface CopyableFieldProps {
  label: string;
  value: string | null;
  monospace?: boolean;
}

function CopyableField({ label, value, monospace }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text
          style={[styles.fieldValue, monospace && styles.monospace]}
          numberOfLines={monospace ? 1 : undefined}
          selectable
        >
          {value || 'N/A'}
        </Text>
        {value && (
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Text style={styles.copyButtonText}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.detailValue}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

interface PropertyDiffProps {
  title: string;
  data: Record<string, unknown> | undefined;
}

function PropertySection({ title, data }: PropertyDiffProps) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <View style={styles.propertySection}>
      <Text style={styles.propertySectionTitle}>{title}</Text>
      <View style={styles.propertyBox}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.propertyRow}>
            <Text style={styles.propertyKey}>{key}:</Text>
            <Text style={styles.propertyValue} selectable>
              {typeof value === 'object' ? JSON.stringify(value) : String(value ?? 'null')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AuditDetailModal({ visible, log, onClose }: AuditDetailModalProps) {
  if (!log) return null;

  const eventColors = getEventColor(log.event);
  const properties = log.properties || {};
  const attributes = properties.attributes as Record<string, unknown> | undefined;
  const oldValues = properties.old as Record<string, unknown> | undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.eventBadge, { backgroundColor: eventColors.bg }]}>
                <Text style={[styles.eventText, { color: eventColors.text }]}>
                  {log.event}
                </Text>
              </View>
              <Text style={styles.title}>{log.description}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Trace / Batch ID - Important for debugging */}
            {log.batch_uuid && (
              <View style={styles.traceSection}>
                <Text style={styles.traceSectionTitle}>Trace Information</Text>
                <CopyableField
                  label="Batch/Trace ID"
                  value={log.batch_uuid}
                  monospace
                />
              </View>
            )}

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <View style={styles.card}>
                <DetailRow label="Event Type" value={log.event} />
                <DetailRow label="Log Name" value={log.log_name} />
                <DetailRow label="Timestamp" value={formatDate(log.created_at)} />
              </View>
            </View>

            {/* Subject Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subject</Text>
              <View style={styles.card}>
                <DetailRow
                  label="Type"
                  value={
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {formatSubjectType(log.subject_type)}
                      </Text>
                    </View>
                  }
                />
                <CopyableField label="Subject ID" value={log.subject_id} monospace />
              </View>
            </View>

            {/* User/Causer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performed By</Text>
              <View style={styles.card}>
                <DetailRow
                  label="User"
                  value={log.causer?.name || 'System'}
                />
                {log.causer?.email && (
                  <DetailRow label="Email" value={log.causer.email} />
                )}
                <CopyableField
                  label="User ID"
                  value={log.causer_id}
                  monospace
                />
              </View>
            </View>

            {/* IDs Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Identifiers</Text>
              <View style={styles.card}>
                <CopyableField label="Log ID" value={log.id} monospace />
                {log.batch_uuid && (
                  <CopyableField
                    label="Batch UUID"
                    value={log.batch_uuid}
                    monospace
                  />
                )}
              </View>
            </View>

            {/* Changes - Show diff */}
            {(attributes || oldValues) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Changes</Text>
                <View style={styles.diffContainer}>
                  <PropertySection title="New Values" data={attributes} />
                  <PropertySection title="Previous Values" data={oldValues} />
                </View>
              </View>
            )}

            {/* Raw Properties - for advanced users */}
            {properties && Object.keys(properties).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Raw Properties</Text>
                <View style={styles.rawPropertiesCard}>
                  <Text style={styles.rawPropertiesText} selectable>
                    {JSON.stringify(properties, null, 2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
              <Text style={styles.closeFooterButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  eventBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  traceSection: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  traceSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  field: {
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  fieldValue: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
  },
  copyButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  diffContainer: {
    gap: SPACING.md,
  },
  propertySection: {
    marginBottom: SPACING.sm,
  },
  propertySectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  propertyBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  propertyRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  propertyKey: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    marginRight: SPACING.sm,
    fontFamily: 'monospace',
  },
  propertyValue: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  rawPropertiesCard: {
    backgroundColor: COLORS.sidebar,
    borderRadius: 8,
    padding: SPACING.md,
    maxHeight: 200,
  },
  rawPropertiesText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  closeFooterButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});
