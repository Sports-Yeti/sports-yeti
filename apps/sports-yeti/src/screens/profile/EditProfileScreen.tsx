import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList, Sport, ExperienceLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type EditProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
}

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'football', label: 'Football' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
];

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    sportPreferences: user?.sportPreferences || [],
    experienceLevel: user?.experienceLevel || 'beginner',
  });

  const [isLoading, setIsLoading] = useState(false);

  const toggleSport = (sport: Sport) => {
    const updated = form.sportPreferences.includes(sport)
      ? form.sportPreferences.filter((s) => s !== sport)
      : [...form.sportPreferences, sport];

    setForm({ ...form, sportPreferences: updated });
  };

  const handleSaveProfile = async () => {
    if (!form.firstName || !form.lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(form);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            autoCapitalize="words"
          />

          <Input
            label="Bio (Optional)"
            placeholder="Tell us about yourself"
            value={form.bio}
            onChangeText={(text) => setForm({ ...form, bio: text })}
            multiline
            numberOfLines={4}
          />

          <Input
            label="Phone (Optional)"
            placeholder="Enter your phone number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sports You Play</Text>
            <View style={styles.chipsContainer}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.value}
                  style={[
                    styles.chip,
                    form.sportPreferences.includes(sport.value) &&
                      styles.chipSelected,
                  ]}
                  onPress={() => toggleSport(sport.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.sportPreferences.includes(sport.value) &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Experience Level</Text>
            <View style={styles.chipsContainer}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.chip,
                    form.experienceLevel === level.value && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setForm({ ...form, experienceLevel: level.value })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.experienceLevel === level.value &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.saveButton}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    minWidth: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  placeholder: {
    minWidth: 60,
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#ffffff',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#212529',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
