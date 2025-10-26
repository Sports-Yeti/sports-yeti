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
import { RouteProp } from '@react-navigation/native';
import { FacilityStackParamList } from '../../types';
import { getFacilityById } from '../../mocks/data';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type FacilityDetailsScreenNavigationProp = StackNavigationProp<
  FacilityStackParamList,
  'FacilityDetails'
>;
type FacilityDetailsScreenRouteProp = RouteProp<
  FacilityStackParamList,
  'FacilityDetails'
>;

interface Props {
  navigation: FacilityDetailsScreenNavigationProp;
  route: FacilityDetailsScreenRouteProp;
}

const FacilityDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { facilityId } = route.params;
  const facility = getFacilityById(facilityId);
  const [selectedTab, setSelectedTab] = useState<
    'spaces' | 'equipment' | 'info'
  >('spaces');

  if (!facility) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Facility not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  const navigateToBooking = (spaceId: string) => {
    navigation.navigate('BookFacility', { facilityId, spaceId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        {facility.photos.length > 0 && (
          <Image
            source={{ uri: facility.photos[0] }}
            style={styles.heroImage}
          />
        )}

        {/* Facility Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <Text style={styles.rating}>⭐ {facility.rating}</Text>
          </View>

          <Text style={styles.address}>{facility.address}</Text>

          <View style={styles.contactRow}>
            {facility.contactInfo.phone && (
              <Text style={styles.contactInfo}>
                📞 {facility.contactInfo.phone}
              </Text>
            )}
            {facility.contactInfo.email && (
              <Text style={styles.contactInfo}>
                ✉️ {facility.contactInfo.email}
              </Text>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'spaces' && styles.tabActive]}
            onPress={() => setSelectedTab('spaces')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'spaces' && styles.tabTextActive,
              ]}
            >
              Spaces ({facility.spaces.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'equipment' && styles.tabActive,
            ]}
            onPress={() => setSelectedTab('equipment')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'equipment' && styles.tabTextActive,
              ]}
            >
              Equipment ({facility.equipment.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
            onPress={() => setSelectedTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'info' && styles.tabTextActive,
              ]}
            >
              Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {selectedTab === 'spaces' && (
            <View>
              {facility.spaces.map((space) => (
                <View key={space.id} style={styles.spaceCard}>
                  <View style={styles.spaceHeader}>
                    <Text style={styles.spaceName}>{space.name}</Text>
                    <Text style={styles.spaceSport}>{space.sportType}</Text>
                  </View>

                  <View style={styles.spaceDetails}>
                    <Text style={styles.spaceDetail}>
                      Capacity: {space.capacity}
                    </Text>
                    <Text style={styles.spaceDetail}>•</Text>
                    <Text style={styles.spaceDetail}>
                      {space.pointCost} pts/hr
                    </Text>
                    <Text style={styles.spaceDetail}>•</Text>
                    <Text style={styles.spaceDetail}>${space.cashCost}/hr</Text>
                  </View>

                  <View style={styles.spaceAmenities}>
                    {space.amenities.map((amenity, index) => (
                      <Text key={index} style={styles.amenityTag}>
                        {amenity}
                      </Text>
                    ))}
                  </View>

                  <Button
                    title="Book This Space"
                    onPress={() => navigateToBooking(space.id)}
                    variant="primary"
                    size="small"
                    style={styles.bookButton}
                  />
                </View>
              ))}
            </View>
          )}

          {selectedTab === 'equipment' && (
            <View>
              {facility.equipment.map((equipment) => (
                <View key={equipment.id} style={styles.equipmentCard}>
                  <View style={styles.equipmentHeader}>
                    <Text style={styles.equipmentName}>{equipment.name}</Text>
                    <Text
                      style={[
                        styles.equipmentCondition,
                        equipment.condition === 'excellent' &&
                          styles.conditionExcellent,
                        equipment.condition === 'good' && styles.conditionGood,
                      ]}
                    >
                      {equipment.condition}
                    </Text>
                  </View>

                  <Text style={styles.equipmentType}>{equipment.type}</Text>

                  <View style={styles.equipmentPricing}>
                    <Text style={styles.equipmentPrice}>
                      {equipment.pointCost} pts
                    </Text>
                    <Text style={styles.equipmentPrice}>
                      ${equipment.cashCost}
                    </Text>
                  </View>

                  <View style={styles.equipmentStatus}>
                    <Text
                      style={[
                        styles.availabilityBadge,
                        equipment.available
                          ? styles.availableBadge
                          : styles.unavailableBadge,
                      ]}
                    >
                      {equipment.available ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {selectedTab === 'info' && (
            <View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Operating Hours</Text>
                {facility.operatingHours.map((hours, index) => (
                  <View key={index} style={styles.hoursRow}>
                    <Text style={styles.dayText}>{hours.dayOfWeek}</Text>
                    <Text style={styles.hoursText}>
                      {hours.isOpen
                        ? `${hours.openTime} - ${hours.closeTime}`
                        : 'Closed'}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Amenities</Text>
                <View style={styles.amenitiesList}>
                  {facility.amenities.map((amenity, index) => (
                    <Text key={index} style={styles.amenityItem}>
                      ✓ {amenity}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Liability Information</Text>
                <Text style={styles.liabilityText}>
                  {facility.liabilityInfo}
                </Text>
              </View>
            </View>
          )}
        </View>
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
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e9ecef',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  rating: {
    fontSize: 16,
    color: '#ffc107',
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
  },
  contactInfo: {
    fontSize: 12,
    color: '#007AFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 400,
  },
  spaceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  spaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  spaceSport: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  spaceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  spaceDetail: {
    fontSize: 12,
    color: '#6c757d',
  },
  spaceAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityTag: {
    fontSize: 10,
    color: '#6c757d',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bookButton: {
    alignSelf: 'flex-start',
  },
  equipmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  equipmentCondition: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  conditionExcellent: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  conditionGood: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  equipmentType: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  equipmentPricing: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  equipmentPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  equipmentStatus: {
    marginTop: 4,
  },
  availabilityBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  availableBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  unavailableBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayText: {
    fontSize: 14,
    color: '#212529',
    textTransform: 'capitalize',
  },
  hoursText: {
    fontSize: 14,
    color: '#6c757d',
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    fontSize: 14,
    color: '#212529',
  },
  liabilityText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#212529',
    marginBottom: 16,
  },
});

export default FacilityDetailsScreen;
