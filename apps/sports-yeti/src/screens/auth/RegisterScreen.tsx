import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, Sport, ExperienceLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
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

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    sportPreferences: [] as Sport[],
    experienceLevel: 'beginner' as ExperienceLevel,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isLoading } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!form.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (form.sportPreferences.length === 0) {
      newErrors.sportPreferences = 'Please select at least one sport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(form);
      // Navigation will be handled by the AuthContext when user state changes
    } catch (error) {
      Alert.alert('Registration Failed', 'Please check your information and try again.');
    }
  };

  const toggleSport = (sport: Sport) => {
    const updatedSports = form.sportPreferences.includes(sport)
      ? form.sportPreferences.filter(s => s !== sport)
      : [...form.sportPreferences, sport];

    setForm({ ...form, sportPreferences: updatedSports });
    if (errors.sportPreferences) {
      setErrors({ ...errors, sportPreferences: '' });
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Sports Yeti</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            autoCapitalize="words"
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            autoCapitalize="words"
            error={errors.lastName}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Phone (Optional)"
            placeholder="Enter your phone number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sports You Play</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.value}
                  style={[
                    styles.sportChip,
                    form.sportPreferences.includes(sport.value) && styles.sportChipSelected,
                  ]}
                  onPress={() => toggleSport(sport.value)}
                >
                  <Text
                    style={[
                      styles.sportChipText,
                      form.sportPreferences.includes(sport.value) && styles.sportChipTextSelected,
                    ]}
                  >
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.sportPreferences && (
              <Text style={styles.errorText}>{errors.sportPreferences}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Experience Level</Text>
            <View style={styles.experienceGrid}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceChip,
                    form.experienceLevel === level.value && styles.experienceChipSelected,
                  ]}
                  onPress={() => setForm({ ...form, experienceLevel: level.value })}
                >
                  <Text
                    style={[
                      styles.experienceChipText,
                      form.experienceLevel === level.value && styles.experienceChipTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="primary"
            size="large"
            style={styles.registerButton}
            loading={isLoading}
          />

          <TouchableOpacity style={styles.loginLink} onPress={navigateToLogin}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#ffffff',
  },
  sportChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sportChipText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  sportChipTextSelected: {
    color: '#ffffff',
  },
  experienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#ffffff',
  },
  experienceChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  experienceChipText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  experienceChipTextSelected: {
    color: '#ffffff',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginLink: {
    alignSelf: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loginLinkBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;