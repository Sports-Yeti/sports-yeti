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
import { LeagueStackParamList } from '../../types';
import { getLeagueById } from '../../mocks/data';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type JoinLeagueScreenNavigationProp = StackNavigationProp<
  LeagueStackParamList,
  'JoinLeague'
>;
type JoinLeagueScreenRouteProp = RouteProp<LeagueStackParamList, 'JoinLeague'>;

interface Props {
  navigation: JoinLeagueScreenNavigationProp;
  route: JoinLeagueScreenRouteProp;
}

const JoinLeagueScreen: React.FC<Props> = ({ navigation, route }) => {
  const { leagueId } = route.params;
  const { user } = useAuth();
  const league = getLeagueById(leagueId);

  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!league) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>League not found</Text>
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

  const selectedDivision = league.divisions.find(
    (d) => d.id === selectedDivisionId
  );

  const handleJoinLeague = async () => {
    if (!selectedDivisionId) {
      Alert.alert('Select Division', 'Please select a division to join');
      return;
    }

    if (!teamName.trim()) {
      Alert.alert('Team Name Required', 'Please enter your team name');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(
        'Terms Required',
        'Please agree to the league rules and waiver'
      );
      return;
    }

    const registrationFee =
      selectedDivision?.registrationFee || league.registrationFee;

    if (user && user.pointBalance < registrationFee) {
      Alert.alert(
        'Insufficient Points',
        `You need ${registrationFee} points to join. You have ${user.pointBalance} points.`
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement join league API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Registration Successful!',
        `Welcome to ${league.name}! Your team "${teamName}" has been registered.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LeaguesScreen'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to join league. Please try again.');
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
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Join League</Text>
        </View>

        {/* League Info */}
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <Text style={styles.leagueSport}>{league.sportType}</Text>
          <Text style={styles.leagueLocation}>
            {league.location.city}, {league.location.state}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Team Name */}
          <Input
            label="Team Name"
            placeholder="Enter your team name"
            value={teamName}
            onChangeText={setTeamName}
            autoCapitalize="words"
          />

          {/* Division Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Division</Text>

            {league.divisions.map((division) => (
              <TouchableOpacity
                key={division.id}
                style={[
                  styles.divisionCard,
                  selectedDivisionId === division.id &&
                    styles.divisionCardSelected,
                ]}
                onPress={() => setSelectedDivisionId(division.id)}
              >
                <View style={styles.divisionHeader}>
                  <Text style={styles.divisionName}>{division.name}</Text>
                  {selectedDivisionId === division.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                <Text style={styles.divisionDetails}>
                  {division.skillLevel} • Max {division.maxTeams} teams
                </Text>

                <Text style={styles.divisionFee}>
                  {division.registrationFee} points
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cost Summary */}
          {selectedDivision && (
            <View style={styles.costSummary}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Registration Fee</Text>
                <Text style={styles.costValue}>
                  {selectedDivision.registrationFee} pts
                </Text>
              </View>

              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Your Balance</Text>
                <Text style={styles.costValue}>
                  {user?.pointBalance || 0} pts
                </Text>
              </View>

              <View style={styles.costDivider} />

              <View style={styles.costRow}>
                <Text style={styles.costTotalLabel}>Balance After</Text>
                <Text style={styles.costTotalValue}>
                  {(user?.pointBalance || 0) - selectedDivision.registrationFee}{' '}
                  pts
                </Text>
              </View>
            </View>
          )}

          {/* Terms Agreement */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            >
              {agreedToTerms && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the league rules and have read the waiver
            </Text>
          </TouchableOpacity>

          {/* League Rules Preview */}
          <View style={styles.rulesPreview}>
            <Text style={styles.rulesTitle}>League Rules:</Text>
            {league.rules.slice(0, 3).map((rule, index) => (
              <Text key={index} style={styles.ruleItem}>
                • {rule}
              </Text>
            ))}
            <TouchableOpacity>
              <Text style={styles.viewAllRules}>View all rules →</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={`Join League (${
              selectedDivision?.registrationFee || league.registrationFee
            } pts)`}
            onPress={handleJoinLeague}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={!selectedDivisionId || !teamName.trim() || !agreedToTerms}
            style={styles.joinButton}
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  inviteButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  leagueInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  leagueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  leagueSport: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  leagueLocation: {
    fontSize: 14,
    color: '#6c757d',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  divisionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  divisionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  divisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divisionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
  },
  divisionDetails: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  divisionFee: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  costSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  costLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  costValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  costTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  costTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
  rulesPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  ruleItem: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 4,
  },
  viewAllRules: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 8,
  },
  joinButton: {
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
});

export default JoinLeagueScreen;
