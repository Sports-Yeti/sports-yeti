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
import { TeamStackParamList, Sport, SkillLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type CreateTeamScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'CreateTeam'
>;

interface Props {
  navigation: CreateTeamScreenNavigationProp;
}

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'football', label: 'Football' },
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'recreational', label: 'Recreational' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'semi-professional', label: 'Semi-Pro' },
  { value: 'professional', label: 'Professional' },
];

const CreateTeamScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    sport: 'basketball' as Sport,
    skillLevel: 'recreational' as SkillLevel,
    maxMembers: '12',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (form.name.length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }

    if (!form.maxMembers || parseInt(form.maxMembers) < 5) {
      newErrors.maxMembers = 'Team must have at least 5 members';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTeam = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement create team API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Team Created!',
        `${form.name} has been created successfully. You are now the team captain!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TeamsScreen'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create team. Please try again.');
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
          <Text style={styles.title}>Create Team</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Input
            label="Team Name"
            placeholder="Enter team name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            autoCapitalize="words"
            error={errors.name}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Sport</Text>
            <View style={styles.chipsContainer}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.value}
                  style={[
                    styles.chip,
                    form.sport === sport.value && styles.chipSelected,
                  ]}
                  onPress={() => setForm({ ...form, sport: sport.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.sport === sport.value && styles.chipTextSelected,
                    ]}
                  >
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Skill Level</Text>
            <View style={styles.chipsContainer}>
              {SKILL_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.chip,
                    form.skillLevel === level.value && styles.chipSelected,
                  ]}
                  onPress={() => setForm({ ...form, skillLevel: level.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.skillLevel === level.value &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Maximum Members"
            placeholder="How many players can join?"
            value={form.maxMembers}
            onChangeText={(text) => setForm({ ...form, maxMembers: text })}
            keyboardType="numeric"
            error={errors.maxMembers}
          />

          <Input
            label="Description (Optional)"
            placeholder="Tell others about your team"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            numberOfLines={4}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              As team captain, you'll be responsible for managing the roster,
              coordinating games, and representing the team.
            </Text>
          </View>

          <Button
            title="Create Team"
            onPress={handleCreateTeam}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.createButton}
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
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  createButton: {
    marginBottom: 20,
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
  heroSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 24,
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  teamSport: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  teamSkillLevel: {
    fontSize: 12,
    color: '#6c757d',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  memberRole: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  captainBadge: {
    fontSize: 24,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  actionButton: {
    marginTop: 12,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default CreateTeamScreen;
