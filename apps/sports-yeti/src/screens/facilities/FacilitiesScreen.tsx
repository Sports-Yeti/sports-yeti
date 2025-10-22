import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FacilityStackParamList } from '../../types';
import { getFacilitiesBySport } from '../../mocks/data';
import Button from '../../components/common/Button';

type FacilitiesScreenNavigationProp = StackNavigationProp<FacilityStackParamList, 'FacilitiesScreen'>;

interface Props {
  navigation: FacilitiesScreenNavigationProp;
}

const FacilitiesScreen: React.FC<Props> = ({ navigation }) => {
  const facilities = getFacilitiesBySport('basketball'); // Default to basketball

  const navigateToFacilityDetails = (facilityId: string) => {
    navigation.navigate('FacilityDetails', { facilityId });
  };

  const navigateToQRScanner = () => {
    navigation.navigate('QRScanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Facilities</Text>
          <Text style={styles.subtitle}>Book courts, fields, and equipment</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <Button
              title="📷 QR Scanner"
              onPress={navigateToQRScanner}
              variant="outline"
              size="medium"
              style={styles.qrButton}
            />

            <Button
              title="🔍 Search"
              onPress={() => {}}
              variant="outline"
              size="medium"
              style={styles.searchButton}
            />
          </View>
        </View>

        {/* Facilities List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Facilities</Text>

          {facilities.length > 0 ? (
            facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={styles.facilityCard}
                onPress={() => navigateToFacilityDetails(facility.id)}
              >
                <View style={styles.facilityHeader}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityRating}>⭐ {facility.rating}</Text>
                </View>

                <Text style={styles.facilityAddress}>{facility.address}</Text>

                <View style={styles.facilityDetails}>
                  <Text style={styles.facilityDetail}>
                    {facility.spaces.length} spaces
                  </Text>
                  <Text style={styles.facilityDetail}>•</Text>
                  <Text style={styles.facilityDetail}>
                    {facility.equipment.length} equipment types
                  </Text>
                </View>

                <View style={styles.facilityAmenities}>
                  {facility.amenities.slice(0, 3).map((amenity, index) => (
                    <Text key={index} style={styles.amenityTag}>
                      {amenity}
                    </Text>
                  ))}
                </View>

                <Button
                  title="Book Now"
                  onPress={() => navigateToFacilityDetails(facility.id)}
                  variant="primary"
                  size="small"
                  style={styles.bookButton}
                />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏟️</Text>
              <Text style={styles.emptyStateTitle}>No Facilities Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                No facilities available for your selected sport and location
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
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
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  qrButton: {
    flex: 1,
  },
  searchButton: {
    flex: 1,
  },
  facilityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  facilityRating: {
    fontSize: 14,
    color: '#ffc107',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  facilityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  facilityDetail: {
    fontSize: 12,
    color: '#6c757d',
  },
  facilityAmenities: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default FacilitiesScreen;