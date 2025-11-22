import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type AchievementsScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Achievements'
>;

interface Props {
  navigation: AchievementsScreenNavigationProp;
}

const ACHIEVEMENTS = [
  {
    id: 'ach-1',
    name: 'Rookie',
    description: 'Played your first game',
    icon: '🌟',
    points: 50,
    unlocked: true,
  },
  {
    id: 'ach-2',
    name: 'Team Captain',
    description: 'Created your first team',
    icon: '👑',
    points: 100,
    unlocked: true,
  },
  {
    id: 'ach-3',
    name: 'Social Butterfly',
    description: 'Made 10 posts',
    icon: '🦋',
    points: 75,
    unlocked: false,
  },
  {
    id: 'ach-4',
    name: 'Veteran',
    description: 'Played 50 games',
    icon: '🎖️',
    points: 250,
    unlocked: false,
  },
  {
    id: 'ach-5',
    name: 'Legend',
    description: 'Played 500 games',
    icon: '🏆',
    points: 1000,
    unlocked: false,
  },
  {
    id: 'ach-6',
    name: 'Community Leader',
    description: 'Earned 1000+ followers',
    icon: '👥',
    points: 500,
    unlocked: false,
  },
];

const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalPoints = ACHIEVEMENTS.filter((a) => a.unlocked).reduce(
    (sum, a) => sum + a.points,
    0
  );

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
          <Text style={styles.title}>Achievements</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {unlockedCount}/{ACHIEVEMENTS.length}
            </Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        {/* Achievements List */}
        <View style={styles.content}>
          {ACHIEVEMENTS.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked,
              ]}
            >
              <Text
                style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.achievementIconLocked,
                ]}
              >
                {achievement.icon}
              </Text>

              <View style={styles.achievementContent}>
                <Text
                  style={[
                    styles.achievementName,
                    !achievement.unlocked && styles.achievementNameLocked,
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                <Text style={styles.achievementPoints}>
                  +{achievement.points} points
                </Text>
              </View>

              {achievement.unlocked && (
                <Text style={styles.unlockedBadge}>✓</Text>
              )}
            </View>
          ))}
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
    fontSize: 28,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#6c757d',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  unlockedBadge: {
    fontSize: 24,
    color: '#28a745',
  },
});

export default AchievementsScreen;
