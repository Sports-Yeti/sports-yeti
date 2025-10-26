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
import { RouteProp } from '@react-navigation/native';
import { TeamStackParamList, Sport, SkillLevel } from '../../types';
import { getTeamById } from '../../mocks/data';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type EditTeamScreenNavigationProp = StackNavigationProp<
  TeamStackParamList,
  'EditTeam'
>;
type EditTeamScreenRouteProp = RouteProp<TeamStackParamList, 'EditTeam'>;

interface Props {
  navigation: EditTeamScreenNavigationProp;
  route: EditTeamScreenRouteProp;
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

const EditTeamScreen: React.FC<Props> = ({ navigation, route }) => {
  const { teamId } = route.params;
  const team = getTeamById(teamId);

  const [form, setForm] = useState({
    name: team?.name || '',
    sport: team?.sport || ('basketball' as Sport),
    skillLevel: team?.skillLevel || ('recreational' as SkillLevel),
    maxMembers: team?.maxMembers.toString() || '12',
    description: team?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Team not found</Text>
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

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement update team API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Team updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete team API call
            Alert.alert('Team Deleted', 'The team has been deleted.', [
              { text: 'OK', onPress: () => navigation.navigate('TeamsScreen') },
            ]);
          },
        },
      ]
    );
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
          <Text style={styles.title}>Edit Team</Text>
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

          <Button
            title="Save Changes"
            onPress={handleSaveChanges}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.saveButton}
          />

          <Button
            title="Delete Team"
            onPress={handleDeleteTeam}
            variant="danger"
            size="large"
            style={styles.deleteButton}
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
  saveButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 24,
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

export default EditTeamScreen;
