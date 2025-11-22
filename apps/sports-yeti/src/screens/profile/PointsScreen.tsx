import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList, PointTransaction } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getPointTransactionsByUser } from '../../mocks/data';
import Button from '../../components/common/Button';

type PointsScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Points'
>;

interface Props {
  navigation: PointsScreenNavigationProp;
}

const PointsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'earned' | 'spent'>(
    'all'
  );

  const transactions = user ? getPointTransactionsByUser(user.id) : [];

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedTab === 'earned') return transaction.pointsEarned > 0;
    if (selectedTab === 'spent') return transaction.pointsSpent > 0;
    return true;
  });

  const totalEarned = transactions.reduce((sum, t) => sum + t.pointsEarned, 0);
  const totalSpent = transactions.reduce((sum, t) => sum + t.pointsSpent, 0);

  const getTransactionIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      earned_game: '🏀',
      earned_content: '📝',
      earned_achievement: '🏆',
      earned_referral: '🤝',
      spent_booking: '🏟️',
      spent_equipment: '⚽',
      spent_tournament: '🏆',
      wagered_game: '🎲',
      won_wager: '🎉',
      lost_wager: '😔',
      purchase: '💳',
      refund: '↩️',
    };
    return iconMap[type] || '💰';
  };

  const renderTransaction = ({ item }: { item: PointTransaction }) => (
    <View style={styles.transactionCard}>
      <Text style={styles.transactionIcon}>
        {getTransactionIcon(item.transactionType)}
      </Text>

      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionType}>
          {item.transactionType.replace(/_/g, ' ')}
        </Text>
        <Text style={styles.transactionTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        {item.pointsEarned > 0 ? (
          <Text style={styles.earnedAmount}>+{item.pointsEarned}</Text>
        ) : (
          <Text style={styles.spentAmount}>-{item.pointsSpent}</Text>
        )}
        <Text style={styles.balanceText}>Bal: {item.balance}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Points & Rewards</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>{user?.pointBalance || 0}</Text>
        <Text style={styles.balanceSubtext}>points</Text>

        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>+{totalEarned}</Text>
            <Text style={styles.balanceStatLabel}>Total Earned</Text>
          </View>

          <View style={styles.balanceStatDivider} />

          <View style={styles.balanceStat}>
            <Text style={styles.balanceStatValue}>-{totalSpent}</Text>
            <Text style={styles.balanceStatLabel}>Total Spent</Text>
          </View>
        </View>

        <Button
          title="Purchase Points"
          onPress={() => {}}
          variant="primary"
          size="medium"
          style={styles.purchaseButton}
        />
      </View>

      {/* Earn Points Section */}
      <View style={styles.earnSection}>
        <Text style={styles.earnTitle}>Ways to Earn Points</Text>

        <View style={styles.earnGrid}>
          <View style={styles.earnCard}>
            <Text style={styles.earnIcon}>🏀</Text>
            <Text style={styles.earnPoints}>25-100 pts</Text>
            <Text style={styles.earnLabel}>Play Games</Text>
          </View>

          <View style={styles.earnCard}>
            <Text style={styles.earnIcon}>📝</Text>
            <Text style={styles.earnPoints}>10-50 pts</Text>
            <Text style={styles.earnLabel}>Create Content</Text>
          </View>

          <View style={styles.earnCard}>
            <Text style={styles.earnIcon}>🤝</Text>
            <Text style={styles.earnPoints}>500 pts</Text>
            <Text style={styles.earnLabel}>Refer Friends</Text>
          </View>

          <View style={styles.earnCard}>
            <Text style={styles.earnIcon}>🏆</Text>
            <Text style={styles.earnPoints}>100-1000 pts</Text>
            <Text style={styles.earnLabel}>Achievements</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'all' && styles.tabTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'earned' && styles.tabActive]}
          onPress={() => setSelectedTab('earned')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'earned' && styles.tabTextActive,
            ]}
          >
            Earned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'spent' && styles.tabActive]}
          onPress={() => setSelectedTab('spent')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'spent' && styles.tabTextActive,
            ]}
          >
            Spent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💰</Text>
            <Text style={styles.emptyStateTitle}>No Transactions</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your point transactions will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  balanceCard: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  balanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  purchaseButton: {
    minWidth: 200,
    backgroundColor: '#ffffff',
  },
  earnSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  earnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  earnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  earnCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  earnIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  earnPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  earnLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 10,
    color: '#8E8E93',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  earnedAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 2,
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 2,
  },
  balanceText: {
    fontSize: 10,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default PointsScreen;
