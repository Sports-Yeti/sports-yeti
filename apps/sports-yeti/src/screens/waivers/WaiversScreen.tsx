import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface WaiverItem {
  id: string;
  league_id: string;
  title: string;
  content: string;
  is_required: boolean;
  is_signed?: boolean;
  signed_at?: string | null;
  league?: { name: string };
}

export function WaiversScreen() {
  const [waivers, setWaivers] = useState<WaiverItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeWaiver, setActiveWaiver] = useState<WaiverItem | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const loadWaivers = useCallback(async () => {
    try {
      const data = (await api.getWaivers()) as WaiverItem[];
      setWaivers(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Failed to load waivers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWaivers();
  }, [loadWaivers]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadWaivers();
  }, [loadWaivers]);

  const handleSign = async () => {
    if (!activeWaiver) return;
    setIsSigning(true);
    try {
      await api.signWaiver(activeWaiver.id);
      Alert.alert('Signed', 'Waiver signed successfully.');
      setActiveWaiver(null);
      loadWaivers();
    } catch {
      Alert.alert('Error', 'Failed to sign waiver. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const renderItem = ({ item }: { item: WaiverItem }) => {
    const isSigned = !!item.is_signed;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              isSigned ? styles.statusSigned : styles.statusUnsigned,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isSigned ? styles.statusSignedText : styles.statusUnsignedText,
              ]}
            >
              {isSigned ? 'Signed' : item.is_required ? 'Required' : 'Optional'}
            </Text>
          </View>
        </View>

        {item.league?.name && (
          <Text style={styles.leagueText}>{item.league.name}</Text>
        )}

        {isSigned && item.signed_at && (
          <Text style={styles.signedDate}>
            Signed on {new Date(item.signed_at).toLocaleDateString()}
          </Text>
        )}

        {!isSigned && (
          <TouchableOpacity
            style={styles.signButton}
            onPress={() => setActiveWaiver(item)}
          >
            <Text style={styles.signButtonText}>Sign Waiver</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={waivers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No Waivers</Text>
            <Text style={styles.emptyText}>
              You have no waivers to sign at this time.
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!activeWaiver}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveWaiver(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{activeWaiver?.title}</Text>
            {activeWaiver?.league?.name && (
              <Text style={styles.modalSubtitle}>
                {activeWaiver.league.name}
              </Text>
            )}

            <ScrollView style={styles.contentScroll}>
              <Text style={styles.contentText}>
                {activeWaiver?.content ?? ''}
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setActiveWaiver(null)}
                disabled={isSigning}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSignButton,
                  isSigning && styles.modalSignDisabled,
                ]}
                onPress={handleSign}
                disabled={isSigning}
              >
                {isSigning ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalSignText}>I Agree and Sign</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  statusSigned: {
    backgroundColor: COLORS.success + '20',
  },
  statusUnsigned: {
    backgroundColor: COLORS.warning + '20',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  statusSignedText: {
    color: COLORS.success,
  },
  statusUnsignedText: {
    color: COLORS.warning,
  },
  leagueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  signedDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  signButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  signButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  contentScroll: {
    maxHeight: 350,
    marginBottom: SPACING.md,
  },
  contentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalSignButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSignDisabled: {
    opacity: 0.6,
  },
  modalSignText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
