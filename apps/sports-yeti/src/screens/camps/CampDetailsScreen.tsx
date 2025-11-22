import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../../types';
import {
  getCampById,
  getCampTrainers,
  isRegisteredForCamp,
  getAvailableSpots,
  getCampSessions,
} from '../../mocks/data';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type CampDetailsScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'CampDetails'>;
type CampDetailsScreenRouteProp = RouteProp<ProfileStackParamList, 'CampDetails'>;

interface Props {
  navigation: CampDetailsScreenNavigationProp;
  route: CampDetailsScreenRouteProp;
}

const CampDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { campId } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'about' | 'schedule' | 'trainers'>('about');

  const camp = getCampById(campId);
  const trainers = getCampTrainers(campId);
  const sessions = getCampSessions(campId);
  const isRegistered = isRegisteredForCamp(campId);
  const availableSpots = getAvailableSpots(campId);

  if (!camp) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camp not found</Text>
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

  const handleRegister = async () => {
    if (camp.status === 'full') {
      Alert.alert('Camp Full', 'This camp is currently full. Please check back later.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual registration API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Registration Successful!',
        `You've been registered for ${camp.name}. A confirmation email has been sent.`,
        [
          {
            text: 'View My Camps',
            onPress: () => {
              // @ts-ignore
              navigation.navigate('MyCamps');
            },
          },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: camp.photos[0] }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Header Info */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{camp.name}</Text>

          <View style={styles.badges}>
            <View
              style={[
                styles.skillBadge,
                { backgroundColor: getSkillLevelColor(camp.skillLevel) },
              ]}
            >
              <Text style={styles.skillBadgeText}>
                {camp.skillLevel.toUpperCase()}
              </Text>
            </View>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>Ages {camp.ageGroup}</Text>
            </View>
            {isRegistered && (
              <View style={styles.registeredBadge}>
                <Text style={styles.registeredBadgeText}>✓ REGISTERED</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${camp.registrationFee}</Text>
            <Text style={styles.spotsLeft}>
              {camp.status === 'full'
                ? 'FULL'
                : `${availableSpots} spots left`}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'about' && styles.tabActive]}
            onPress={() => setSelectedTab('about')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'about' && styles.tabTextActive,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'schedule' && styles.tabActive]}
            onPress={() => setSelectedTab('schedule')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'schedule' && styles.tabTextActive,
              ]}
            >
              Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'trainers' && styles.tabActive]}
            onPress={() => setSelectedTab('trainers')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'trainers' && styles.tabTextActive,
              ]}
            >
              Trainers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'about' && (
          <View style={styles.content}>
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{camp.description}</Text>
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsList}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Dates</Text>
                    <Text style={styles.detailValue}>
                      {new Date(camp.startDate).toLocaleDateString()} -{' '}
                      {new Date(camp.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏰</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Schedule</Text>
                    <Text style={styles.detailValue}>
                      {camp.scheduleDescription}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {camp.location.address}
                      {'\n'}
                      {camp.location.city}, {camp.location.state}{' '}
                      {camp.location.zipCode}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>👥</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Capacity</Text>
                    <Text style={styles.detailValue}>
                      {camp.currentParticipants}/{camp.maxParticipants}{' '}
                      participants
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {camp.requirements.map((req, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text style={styles.listText}>{req}</Text>
                </View>
              ))}
            </View>

            {/* Benefits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You'll Get</Text>
              {camp.benefits.map((benefit, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listCheck}>✓</Text>
                  <Text style={styles.listText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'schedule' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Sessions</Text>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.sessionDescription}>
                      {session.description}
                    </Text>
                    <View style={styles.sessionDetails}>
                      <Text style={styles.sessionTime}>
                        {new Date(session.startTime).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noScheduleText}>
                  Detailed schedule will be available after registration
                </Text>
              )}
            </View>
          </View>
        )}

        {selectedTab === 'trainers' && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Trainers</Text>
              {trainers.map((trainer) => (
                <View key={trainer.id} style={styles.trainerCard}>
                  <Image
                    source={{ uri: trainer.avatar }}
                    style={styles.trainerAvatar}
                  />
                  <View style={styles.trainerInfo}>
                    <Text style={styles.trainerName}>
                      {trainer.firstName} {trainer.lastName}
                    </Text>
                    <Text style={styles.trainerBio}>{trainer.bio}</Text>

                    <View style={styles.trainerCerts}>
                      {trainer.certifications.map((cert, index) => (
                        <View key={index} style={styles.certBadge}>
                          <Text style={styles.certText}>{cert}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.trainerStats}>
                      <Text style={styles.trainerRating}>
                        ⭐ {trainer.rating.toFixed(1)} ({trainer.reviewCount}{' '}
                        reviews)
                      </Text>
                    </View>

                    {trainer.specialties && (
                      <View style={styles.specialties}>
                        <Text style={styles.specialtiesLabel}>Specialties:</Text>
                        <Text style={styles.specialtiesText}>
                          {trainer.specialties.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Register Button */}
      {!isRegistered && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerPrice}>${camp.registrationFee}</Text>
            <Text style={styles.footerPriceLabel}>Registration Fee</Text>
          </View>
          <Button
            title={camp.status === 'full' ? 'Camp Full' : 'Register Now'}
            onPress={handleRegister}
            variant="primary"
            size="large"
            style={styles.registerButton}
            disabled={camp.status === 'full'}
            loading={isLoading}
          />
        </View>
      )}
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
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e9ecef',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  ageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
  },
  ageBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  registeredBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#28a745',
  },
  registeredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  spotsLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffc107',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#212529',
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 16,
    color: '#6c757d',
    marginRight: 12,
    marginTop: 2,
  },
  listCheck: {
    fontSize: 16,
    color: '#28a745',
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  sessionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
  },
  sessionTime: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  noScheduleText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  trainerCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trainerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  trainerBio: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 8,
  },
  trainerCerts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  certBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  certText: {
    fontSize: 10,
    color: '#495057',
    fontWeight: '500',
  },
  trainerStats: {
    marginBottom: 6,
  },
  trainerRating: {
    fontSize: 13,
    color: '#ffc107',
    fontWeight: '500',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtiesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginRight: 4,
  },
  specialtiesText: {
    flex: 1,
    fontSize: 12,
    color: '#6c757d',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerInfo: {
    flex: 1,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footerPriceLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  registerButton: {
    flex: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 24,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default CampDetailsScreen;

