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
import { HomeStackParamList, Sport, SkillLevel } from '../../types';
import { mockFacilities, mockSpaces } from '../../mocks/data';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type CreateGameScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'HomeScreen'
>;

interface Props {
  navigation: CreateGameScreenNavigationProp;
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

const CreateGameScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    sport: 'basketball' as Sport,
    skillLevel: 'recreational' as SkillLevel,
    teamSize: '5',
    facilityId: '',
    spaceId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '60',
    pointWager: '100',
    rules: '',
    equipmentIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.sport) {
      newErrors.sport = 'Please select a sport';
    }

    if (!form.teamSize || parseInt(form.teamSize) < 2) {
      newErrors.teamSize = 'Team size must be at least 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.facilityId) {
      newErrors.facilityId = 'Please select a facility';
    }

    if (!form.spaceId) {
      newErrors.spaceId = 'Please select a space';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    }

    if (!form.scheduledTime) {
      newErrors.scheduledTime = 'Please select a time';
    }

    if (!form.duration || parseInt(form.duration) < 30) {
      newErrors.duration = 'Duration must be at least 30 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateGame();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateGame = () => {
    // TODO: Implement actual game creation API call
    Alert.alert(
      'Game Created!',
      'Your game has been created successfully. Teams will be notified.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const selectedFacility = mockFacilities.find((f) => f.id === form.facilityId);
  const availableSpaces = selectedFacility
    ? mockSpaces.filter(
        (s) => s.facilityId === form.facilityId && s.sportType === form.sport
      )
    : [];

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              currentStep >= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 4</Text>
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Game Details</Text>
      <Text style={styles.stepSubtitle}>
        Choose your sport and game settings
      </Text>

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
        {errors.sport && <Text style={styles.errorText}>{errors.sport}</Text>}
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
                  form.skillLevel === level.value && styles.chipTextSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Team Size"
        placeholder="Number of players per team"
        value={form.teamSize}
        onChangeText={(text) => setForm({ ...form, teamSize: text })}
        keyboardType="numeric"
        error={errors.teamSize}
      />

      <Input
        label="Point Wager (Optional)"
        placeholder="Points to wager on this game"
        value={form.pointWager}
        onChangeText={(text) => setForm({ ...form, pointWager: text })}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Select Facility</Text>
      <Text style={styles.stepSubtitle}>Choose where you want to play</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Facilities</Text>
        {mockFacilities.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            style={[
              styles.facilityCard,
              form.facilityId === facility.id && styles.facilityCardSelected,
            ]}
            onPress={() =>
              setForm({ ...form, facilityId: facility.id, spaceId: '' })
            }
          >
            <View style={styles.facilityHeader}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              <Text style={styles.facilityRating}>⭐ {facility.rating}</Text>
            </View>
            <Text style={styles.facilityAddress}>{facility.address}</Text>
            <Text style={styles.facilitySpaces}>
              {facility.spaces.length} spaces available
            </Text>
          </TouchableOpacity>
        ))}
        {errors.facilityId && (
          <Text style={styles.errorText}>{errors.facilityId}</Text>
        )}
      </View>

      {form.facilityId && availableSpaces.length > 0 && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Select Space</Text>
          {availableSpaces.map((space) => (
            <TouchableOpacity
              key={space.id}
              style={[
                styles.spaceCard,
                form.spaceId === space.id && styles.spaceCardSelected,
              ]}
              onPress={() => setForm({ ...form, spaceId: space.id })}
            >
              <Text style={styles.spaceName}>{space.name}</Text>
              <Text style={styles.spaceDetails}>
                Capacity: {space.capacity} • {space.pointCost} pts/hour
              </Text>
            </TouchableOpacity>
          ))}
          {errors.spaceId && (
            <Text style={styles.errorText}>{errors.spaceId}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Schedule Game</Text>
      <Text style={styles.stepSubtitle}>When do you want to play?</Text>

      <Input
        label="Date"
        placeholder="YYYY-MM-DD"
        value={form.scheduledDate}
        onChangeText={(text) => setForm({ ...form, scheduledDate: text })}
        error={errors.scheduledDate}
      />

      <Input
        label="Time"
        placeholder="HH:MM (24-hour format)"
        value={form.scheduledTime}
        onChangeText={(text) => setForm({ ...form, scheduledTime: text })}
        error={errors.scheduledTime}
      />

      <Input
        label="Duration (minutes)"
        placeholder="Game duration in minutes"
        value={form.duration}
        onChangeText={(text) => setForm({ ...form, duration: text })}
        keyboardType="numeric"
        error={errors.duration}
      />

      <Input
        label="Custom Rules (Optional)"
        placeholder="Any special rules for this game?"
        value={form.rules}
        onChangeText={(text) => setForm({ ...form, rules: text })}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderStep4 = () => {
    const totalPointCost =
      parseInt(form.pointWager || '0') +
      (selectedFacility
        ? mockSpaces.find((s) => s.id === form.spaceId)?.pointCost || 0
        : 0);

    return (
      <View>
        <Text style={styles.stepTitle}>Review & Confirm</Text>
        <Text style={styles.stepSubtitle}>Review your game details</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sport</Text>
            <Text style={styles.summaryValue}>{form.sport}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Skill Level</Text>
            <Text style={styles.summaryValue}>{form.skillLevel}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Team Size</Text>
            <Text style={styles.summaryValue}>
              {form.teamSize} vs {form.teamSize}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Facility</Text>
            <Text style={styles.summaryValue}>{selectedFacility?.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Space</Text>
            <Text style={styles.summaryValue}>
              {mockSpaces.find((s) => s.id === form.spaceId)?.name}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {form.scheduledDate} at {form.scheduledTime}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{form.duration} minutes</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Total Point Cost</Text>
            <Text style={styles.summaryValueBold}>{totalPointCost} pts</Text>
          </View>

          <Text style={styles.costBreakdown}>
            Includes facility booking + point wager
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Your game will be created and other teams will be able to join.
            Payment will only be processed once all teams confirm participation.
          </Text>
        </View>
      </View>
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
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Game</Text>
        </View>

        {renderProgressBar()}

        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </View>

        <View style={styles.footer}>
          {currentStep > 1 && (
            <Button
              title="Previous"
              onPress={handlePreviousStep}
              variant="outline"
              size="large"
              style={styles.footerButton}
            />
          )}

          <Button
            title={currentStep === 4 ? 'Create Game' : 'Next'}
            onPress={handleNextStep}
            variant="primary"
            size="large"
            style={styles.footerButton}
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
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
  facilityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  facilityCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  facilitySpaces: {
    fontSize: 12,
    color: '#007AFF',
  },
  spaceCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  spaceCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  spaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  spaceDetails: {
    fontSize: 12,
    color: '#6c757d',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#212529',
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  costBreakdown: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 24,
  },
  footerButton: {
    flex: 1,
  },
});

export default CreateGameScreen;
