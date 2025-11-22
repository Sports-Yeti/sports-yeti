import React, { useState } from 'react';
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

type PaymentHistoryScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'PaymentHistory'>;

interface Props {
  navigation: PaymentHistoryScreenNavigationProp;
}

interface Transaction {
  id: string;
  type: 'charge' | 'refund' | 'payout';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'charge',
    description: 'Youth Basketball Skills Camp Registration',
    amount: -299,
    status: 'completed',
    date: '2025-01-18T10:30:00.000Z',
    paymentMethod: 'Visa •••• 4242',
    receiptUrl: '#',
  },
  {
    id: 'txn-2',
    type: 'charge',
    description: 'Facility Booking - Court A',
    amount: -75,
    status: 'completed',
    date: '2025-01-15T14:20:00.000Z',
    paymentMethod: 'Visa •••• 4242',
    receiptUrl: '#',
  },
  {
    id: 'txn-3',
    type: 'charge',
    description: 'Team Registration Fee',
    amount: -150,
    status: 'completed',
    date: '2025-01-10T09:00:00.000Z',
    paymentMethod: 'Mastercard •••• 8888',
    receiptUrl: '#',
  },
  {
    id: 'txn-4',
    type: 'refund',
    description: 'Refund: Cancelled Booking',
    amount: 50,
    status: 'completed',
    date: '2025-01-08T16:45:00.000Z',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'txn-5',
    type: 'charge',
    description: 'Equipment Rental',
    amount: -25,
    status: 'completed',
    date: '2025-01-05T11:30:00.000Z',
    paymentMethod: 'Visa •••• 4242',
    receiptUrl: '#',
  },
];

const PaymentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState<'all' | 'charges' | 'refunds'>('all');
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'charges') return transaction.type === 'charge';
    if (filter === 'refunds') return transaction.type === 'refund';
    return true;
  });

  const totalSpent = transactions
    .filter(t => t.type === 'charge')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalRefunded = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
        return '💳';
      case 'refund':
        return '↩️';
      case 'payout':
        return '💰';
      default:
        return '💵';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownloadReceipt = (transactionId: string) => {
    // TODO: Implement download receipt
    console.log('Download receipt for:', transactionId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.subtitle}>
            View all your transactions and receipts
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.summaryPeriod}>Last 30 days</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Refunded</Text>
            <Text style={[styles.summaryAmount, styles.summaryAmountPositive]}>
              ${totalRefunded.toFixed(2)}
            </Text>
            <Text style={styles.summaryPeriod}>Last 30 days</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'charges' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('charges')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'charges' && styles.filterTabTextActive,
              ]}
            >
              Charges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'refunds' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('refunds')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'refunds' && styles.filterTabTextActive,
              ]}
            >
              Refunds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          {filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                    {transaction.paymentMethod && (
                      <Text style={styles.transactionMethod}>
                        {transaction.paymentMethod}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.amount > 0 && styles.transactionAmountPositive,
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(transaction.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {transaction.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {transaction.receiptUrl && (
                <View style={styles.transactionActions}>
                  <TouchableOpacity
                    onPress={() => handleDownloadReceipt(transaction.id)}
                  >
                    <Text style={styles.receiptLink}>📄 View Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {filteredTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💳</Text>
              <Text style={styles.emptyStateTitle}>No Transactions</Text>
              <Text style={styles.emptyStateText}>
                You don't have any transactions in this category yet
              </Text>
            </View>
          )}
        </View>

        {/* Export Section */}
        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>Export History</Text>
          <Text style={styles.exportText}>
            Download your payment history for your records
          </Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export as PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export as CSV</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 4,
  },
  summaryAmountPositive: {
    color: '#28a745',
  },
  summaryPeriod: {
    fontSize: 11,
    color: '#6c757d',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#6c757d',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ffffff',
  },
  transactionActions: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 12,
    paddingTop: 12,
  },
  receiptLink: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  exportSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 8,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  exportText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default PaymentHistoryScreen;

