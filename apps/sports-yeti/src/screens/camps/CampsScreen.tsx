import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Button from '../../components/common/Button';

const CampsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Training Camps</Text>
          <Text style={styles.subtitle}>
            Improve your skills with professional training
          </Text>
        </View>

        {/* Coming Soon Banner */}
        <View style={styles.comingSoonBanner}>
          <Text style={styles.comingSoonIcon}>⛺</Text>
          <View style={styles.comingSoonContent}>
            <Text style={styles.comingSoonTitle}>
              Training Camps Coming Soon!
            </Text>
            <Text style={styles.comingSoonText}>
              Professional training camps, skill development programs, and
              coaching sessions are on the way.
            </Text>
          </View>
        </View>

        {/* Feature Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Coming</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👨‍🏫</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Professional Coaches</Text>
                <Text style={styles.featureDescription}>
                  Learn from certified trainers and experienced professionals
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📚</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Skill Programs</Text>
                <Text style={styles.featureDescription}>
                  Structured programs for all skill levels and ages
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>
                  Monitor improvement with detailed analytics and feedback
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏅</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Certifications</Text>
                <Text style={styles.featureDescription}>
                  Earn certificates and badges for completing programs
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notify Me */}
        <View style={styles.section}>
          <Text style={styles.notifyTitle}>Be the First to Know</Text>
          <Text style={styles.notifyText}>
            Get notified when training camps launch in your area
          </Text>
          <Button
            title="Notify Me When Available"
            onPress={() => {
              // TODO: Implement notify me functionality
            }}
            variant="primary"
            size="large"
            style={styles.notifyButton}
          />
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
  comingSoonBanner: {
    flexDirection: 'row',
    backgroundColor: '#d1ecf1',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  comingSoonIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  comingSoonContent: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c5460',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  notifyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  notifyText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  notifyButton: {
    alignSelf: 'flex-start',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default CampsScreen;
