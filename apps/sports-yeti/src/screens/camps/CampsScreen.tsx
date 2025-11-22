import React, { useState } from 'react';
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
import { getOpenCamps, isRegisteredForCamp, getAvailableSpots } from '../../mocks/data';
import Button from '../../components/common/Button';

type CampsScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Camps'>;

interface Props {
  navigation: CampsScreenNavigationProp;
}

const CampsScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState<'all' | 'registered'>('all');
  
  const camps = getOpenCamps();
  
  const navigateToCampDetails = (campId: string) => {
    navigation.navigate('CampDetails', { campId });
  };

  const navigateToMyCamps = () => {
    navigation.navigate('MyCamps');
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#28a745';
      case 'intermediate':
        return '#ffc107';
      case 'advanced':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusBadge = (camp: any) => {
    if (camp.status === 'full') {
      return { text: 'Full', color: '#dc3545' };
    }
    const spots = getAvailableSpots(camp.id);
    if (spots <= 5) {
      return { text: `${spots} spots left`, color: '#ffc107' };
    }
    if (isRegisteredForCamp(camp.id)) {
      return { text: 'Registered', color: '#28a745' };
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Training Camps</Text>
          <Text style={styles.subtitle}>
            Improve your skills with professional training
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="📚 My Camps"
            onPress={navigateToMyCamps}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
          <Button
            title="🔍 Search"
            onPress={() => {}}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All Camps ({camps.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'registered' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('registered')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'registered' && styles.filterTabTextActive,
              ]}
            >
              My Camps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Camp List */}
        <View style={styles.section}>
          {camps.length > 0 ? (
            camps.map((camp) => {
              const status = getStatusBadge(camp);
              
              return (
                <TouchableOpacity
                  key={camp.id}
                  style={styles.campCard}
                  onPress={() => navigateToCampDetails(camp.id)}
                >
                  {/* Camp Image */}
                  <Image
                    source={{ uri: camp.photos[0] }}
                    style={styles.campImage}
                    resizeMode="cover"
                  />

                  {/* Camp Info */}
                  <View style={styles.campInfo}>
                    <View style={styles.campHeader}>
                      <Text style={styles.campName} numberOfLines={2}>
                        {camp.name}
                      </Text>
                      {status && (
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: status.color },
                          ]}
                        >
                          <Text style={styles.statusBadgeText}>
                            {status.text}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.campDescription} numberOfLines={2}>
                      {camp.description}
                    </Text>

                    {/* Camp Details */}
                    <View style={styles.campDetails}>
                      <View style={styles.campDetailItem}>
                        <Text style={styles.campDetailIcon}>📅</Text>
                        <Text style={styles.campDetailText}>
                          {new Date(camp.startDate).toLocaleDateString()} -{' '}
                          {new Date(camp.endDate).toLocaleDateString()}
                        </Text>
                      </View>

                      <View style={styles.campDetailItem}>
                        <Text style={styles.campDetailIcon}>📍</Text>
                        <Text style={styles.campDetailText}>
                          {camp.location.city}, {camp.location.state}
                        </Text>
                      </View>

                      <View style={styles.campDetailItem}>
                        <Text style={styles.campDetailIcon}>👥</Text>
                        <Text style={styles.campDetailText}>
                          Ages {camp.ageGroup}
                        </Text>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.campFooter}>
                      <View
                        style={[
                          styles.skillBadge,
                          { borderColor: getSkillLevelColor(camp.skillLevel) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.skillBadgeText,
                            { color: getSkillLevelColor(camp.skillLevel) },
                          ]}
                        >
                          {camp.skillLevel.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.campPrice}>${camp.registrationFee}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⛺</Text>
              <Text style={styles.emptyStateTitle}>No Camps Available</Text>
              <Text style={styles.emptyStateText}>
                Check back soon for new training opportunities
              </Text>
            </View>
          )}
        </View>

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
  backButtonContainer: {
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    paddingVertical: 16,
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
    height: 160,
    backgroundColor: '#e9ecef',
  },
  campInfo: {
    padding: 16,
  },
  campHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campName: {
    flex: 1,
    fontSize: 18,
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
    textTransform: 'uppercase',
  },
  campDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  campDetails: {
    gap: 8,
    marginBottom: 12,
  },
  campDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campDetailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  campDetailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  campFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  skillBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  campPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default CampsScreen;

