import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getPointTransactionsByUser } from '../../mocks/data';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileScreen'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  const recentTransactions = getPointTransactionsByUser(user.id).slice(0, 3);

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  const navigateToPoints = () => {
    navigation.navigate('Points');
  };

  const navigateToAchievements = () => {
    navigation.navigate('Achievements');
  };

  const navigateToDataExport = () => {
    navigation.navigate('DataExport');
  };

  const navigateToHelp = () => {
    navigation.navigate('Help');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.pointBalance}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.achievements.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>

          <Button
            title="Edit Profile"
            onPress={navigateToEditProfile}
            variant="outline"
            size="medium"
            style={styles.editButton}
          />
        </View>

        {/* Bio Section */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Experience Level */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experience Level</Text>
            <Text style={styles.infoValue}>{user.experienceLevel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{user.availabilityStatus}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sports</Text>
            <Text style={styles.infoValue}>
              {user.sportPreferences.join(', ')}
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.pointsEarned > 0
                    ? styles.positiveAmount
                    : styles.negativeAmount,
                ]}
              >
                {transaction.pointsEarned > 0 ? '+' : ''}
                {transaction.pointsEarned} pts
              </Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToPoints}
          >
            <Text style={styles.menuIcon}>💰</Text>
            <Text style={styles.menuTitle}>Points & Rewards</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToAchievements}
          >
            <Text style={styles.menuIcon}>🏆</Text>
            <Text style={styles.menuTitle}>Achievements</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToNotifications}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToSettings}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuTitle}>Settings</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToDataExport}
          >
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuTitle}>Data Export</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToHelp}
          >
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuTitle}>Help & Support</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={logout}
            variant="danger"
            size="medium"
          />
        </View>

        {/* Bottom spacing */}
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
  profileHeader: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  editButton: {
    minWidth: 120,
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
  bioText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    textTransform: 'capitalize',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#28a745',
  },
  negativeAmount: {
    color: '#dc3545',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  menuIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  menuArrow: {
    fontSize: 16,
    color: '#6c757d',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default ProfileScreen;