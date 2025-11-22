import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types';
import { getMyCamps, getMyCampRegistrations } from '../../mocks/data';
import Button from '../../components/common/Button';

type MyCampsScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'MyCamps'>;

interface Props {
  navigation: MyCampsScreenNavigationProp;
}

const MyCampsScreen: React.FC<Props> = ({ navigation }) => {
  const myCamps = getMyCamps();
  const registrations = getMyCampRegistrations();

  const navigateToCampDetails = (campId: string) => {
    navigation.navigate('CampDetails', { campId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'registered':
        return '#007AFF';
      case 'attending':
        return '#28a745';
      case 'completed':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Camps</Text>
          <Text style={styles.subtitle}>
            Your training camps and progress
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myCamps.length}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {registrations.filter(r => r.attendanceStatus === 'attending').length}
            </Text>
            <Text style={styles.statLabel}>Attending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {registrations.filter(r => r.attendanceStatus === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Camps List */}
        <View style={styles.section}>
          {myCamps.length > 0 ? (
            myCamps.map((camp) => {
              const registration = registrations.find(r => r.campId === camp.id);
              const isUpcoming = new Date(camp.startDate) > new Date();
              const isActive = new Date(camp.startDate) <= new Date() && new Date(camp.endDate) >= new Date();

              return (
                <TouchableOpacity
                  key={camp.id}
                  style={styles.campCard}
                  onPress={() => navigateToCampDetails(camp.id)}
                >
                  <Image
                    source={{ uri: camp.photos[0] }}
                    style={styles.campImage}
                    resizeMode="cover"
                  />

                  <View style={styles.campInfo}>
                    <View style={styles.campHeader}>
                      <Text style={styles.campName} numberOfLines={2}>
                        {camp.name}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: registration
                              ? getStatusColor(registration.paymentStatus)
                              : '#6c757d',
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {registration?.paymentStatus.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Camp Dates */}
                    <View style={styles.campDates}>
                      <Text style={styles.campDatesIcon}>📅</Text>
                      <Text style={styles.campDatesText}>
                        {new Date(camp.startDate).toLocaleDateString()} -{' '}
                        {new Date(camp.endDate).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Camp Status */}
                    <View style={styles.campStatus}>
                      {isUpcoming && (
                        <View style={styles.statusChip}>
                          <Text style={styles.statusChipText}>
                            🕐 Starts in{' '}
                            {Math.ceil(
                              (new Date(camp.startDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </Text>
                        </View>
                      )}
                      {isActive && (
                        <View
                          style={[styles.statusChip, styles.statusChipActive]}
                        >
                          <Text style={styles.statusChipTextActive}>
                            ✨ Active Now
                          </Text>
                        </View>
                      )}
                      {!isUpcoming && !isActive && (
                        <View
                          style={[
                            styles.statusChip,
                            styles.statusChipCompleted,
                          ]}
                        >
                          <Text style={styles.statusChipText}>
                            ✓ Completed
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={styles.campActions}>
                      <Button
                        title="View Details"
                        onPress={() => navigateToCampDetails(camp.id)}
                        variant="outline"
                        size="small"
                        style={styles.actionButton}
                      />
                      {isUpcoming && registration?.paymentStatus === 'paid' && (
                        <Button
                          title="Cancel"
                          onPress={() => {
                            // TODO: Implement cancel registration
                          }}
                          variant="outline"
                          size="small"
                          style={styles.actionButton}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⛺</Text>
              <Text style={styles.emptyStateTitle}>No Camps Yet</Text>
              <Text style={styles.emptyStateText}>
                You haven't registered for any training camps yet
              </Text>
              <Button
                title="Browse Camps"
                onPress={() => navigation.goBack()}
                variant="primary"
                size="medium"
                style={styles.browseButton}
              />
            </View>
          )}
        </View>

        {/* Quick Tips */}
        {myCamps.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>✓</Text>
                <Text style={styles.tipText}>
                  Arrive 15 minutes early on your first day
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>✓</Text>
                <Text style={styles.tipText}>
                  Bring water and wear appropriate athletic gear
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>✓</Text>
                <Text style={styles.tipText}>
                  Check-in with your trainer at the start of each session
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  section: {
    paddingVertical: 8,
  },
  campCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e9ecef',
  },
  campInfo: {
    padding: 16,
  },
  campHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  campDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  campDatesIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  campDatesText: {
    fontSize: 13,
    color: '#6c757d',
  },
  campStatus: {
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
  },
  statusChipActive: {
    backgroundColor: '#d1ecf1',
  },
  statusChipCompleted: {
    backgroundColor: '#d4edda',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  statusChipTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0c5460',
  },
  campActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    minWidth: 200,
  },
  tipsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 14,
    color: '#28a745',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default MyCampsScreen;

