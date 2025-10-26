import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type SettingsScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    gameReminders: true,
    teamUpdates: true,
    socialUpdates: false,
    profilePrivate: user?.isPrivate || false,
    showLocation: true,
    showStats: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });

    // If toggling profile privacy, update user profile
    if (key === 'profilePrivate' && user) {
      updateProfile({ isPrivate: newValue });
    }

    // TODO: Save settings to backend
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
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications on your device
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive email updates and newsletters
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Game Reminders</Text>
              <Text style={styles.settingDescription}>
                Get reminded about upcoming games
              </Text>
            </View>
            <Switch
              value={settings.gameReminders}
              onValueChange={() => toggleSetting('gameReminders')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Team Updates</Text>
              <Text style={styles.settingDescription}>
                Notifications about your teams
              </Text>
            </View>
            <Switch
              value={settings.teamUpdates}
              onValueChange={() => toggleSetting('teamUpdates')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Social Updates</Text>
              <Text style={styles.settingDescription}>
                Likes, comments, and follows
              </Text>
            </View>
            <Switch
              value={settings.socialUpdates}
              onValueChange={() => toggleSetting('socialUpdates')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Private Profile</Text>
              <Text style={styles.settingDescription}>
                Only approved followers can see your profile
              </Text>
            </View>
            <Switch
              value={settings.profilePrivate}
              onValueChange={() => toggleSetting('profilePrivate')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Location</Text>
              <Text style={styles.settingDescription}>
                Display your location on your profile
              </Text>
            </View>
            <Switch
              value={settings.showLocation}
              onValueChange={() => toggleSetting('showLocation')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Stats</Text>
              <Text style={styles.settingDescription}>
                Display your game statistics publicly
              </Text>
            </View>
            <Switch
              value={settings.showStats}
              onValueChange={() => toggleSetting('showStats')}
              trackColor={{ false: '#e9ecef', true: '#007AFF' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Change Password</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Language</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>English</Text>
              <Text style={styles.settingArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Blocked Users</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingButton, styles.dangerButton]}>
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Terms of Service</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e9ecef',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
    color: '#6c757d',
  },
  settingArrow: {
    fontSize: 16,
    color: '#6c757d',
  },
  dangerButton: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
  },
  versionRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default SettingsScreen;
