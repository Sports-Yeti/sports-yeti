import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types';

type HelpScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Help'
>;

interface Props {
  navigation: HelpScreenNavigationProp;
}

const HELP_TOPICS = [
  {
    id: '1',
    icon: '🏀',
    title: 'Getting Started',
    description: 'Learn how to use Sports Yeti',
  },
  {
    id: '2',
    icon: '🏟️',
    title: 'Booking Facilities',
    description: 'How to book courts and equipment',
  },
  {
    id: '3',
    icon: '👥',
    title: 'Creating Teams',
    description: 'Guide to team management',
  },
  {
    id: '4',
    icon: '💰',
    title: 'Points System',
    description: 'Understand how points work',
  },
  {
    id: '5',
    icon: '🎮',
    title: 'Creating Games',
    description: 'Set up and manage games',
  },
  {
    id: '6',
    icon: '💳',
    title: 'Payments & Billing',
    description: 'Payment methods and invoices',
  },
];

const HelpScreen: React.FC<Props> = ({ navigation }) => {
  const handleContactSupport = () => {
    // TODO: Open support contact form or email
    Linking.openURL('mailto:support@sportsyeti.com?subject=Help Request');
  };

  const handleOpenFAQ = () => {
    // TODO: Open FAQ page
    Linking.openURL('https://sportsyeti.com/faq');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleContactSupport}
          >
            <Text style={styles.quickActionIcon}>✉️</Text>
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionSubtitle}>
              Get help from our team
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleOpenFAQ}
          >
            <Text style={styles.quickActionIcon}>❓</Text>
            <Text style={styles.quickActionTitle}>FAQ</Text>
            <Text style={styles.quickActionSubtitle}>Common questions</Text>
          </TouchableOpacity>
        </View>

        {/* Help Topics */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Help Topics</Text>

          {HELP_TOPICS.map((topic) => (
            <TouchableOpacity key={topic.id} style={styles.topicCard}>
              <Text style={styles.topicIcon}>{topic.icon}</Text>

              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>

              <Text style={styles.topicArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need More Help?</Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:support@sportsyeti.com')}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactText}>support@sportsyeti.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('tel:+18005551234')}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>1-800-555-1234</Text>
          </TouchableOpacity>

          <Text style={styles.hoursText}>
            Support Hours: Mon-Fri 9am-6pm EST
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  topicArrow: {
    fontSize: 16,
    color: '#6c757d',
  },
  contactSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactText: {
    fontSize: 16,
    color: '#007AFF',
  },
  hoursText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 16,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default HelpScreen;
