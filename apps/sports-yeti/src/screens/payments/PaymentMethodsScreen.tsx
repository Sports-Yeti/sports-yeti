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
import { ProfileStackParamList } from '../../types';
import Button from '../../components/common/Button';

type PaymentMethodsScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'PaymentMethods'>;

interface Props {
  navigation: PaymentMethodsScreenNavigationProp;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand: string;
  last4: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  holderName: string;
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    isDefault: true,
    holderName: 'John Doe',
  },
  {
    id: 'pm-2',
    type: 'card',
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: '06',
    expiryYear: '2026',
    isDefault: false,
    holderName: 'John Doe',
  },
];

const PaymentMethodsScreen: React.FC<Props> = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleSetDefault = async (methodId: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to set default payment method
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        }))
      );
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePaymentMethod = (methodId: string, isDefault: boolean) => {
    if (isDefault && paymentMethods.length > 1) {
      Alert.alert(
        'Cannot Remove',
        'Please set another payment method as default before removing this one.'
      );
      return;
    }

    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement API call to remove payment method
              await new Promise(resolve => setTimeout(resolve, 500));

              setPaymentMethods(methods =>
                methods.filter(method => method.id !== methodId)
              );
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
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
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            Manage your payment methods securely
          </Text>
        </View>

        {/* Security Info */}
        <View style={styles.securityBanner}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityText}>
              All payment information is encrypted and securely stored with Stripe
            </Text>
          </View>
        </View>

        {/* Payment Methods List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardIcon}>{getCardIcon(method.brand)}</Text>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardBrand}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    <Text style={styles.cardHolder}>{method.holderName}</Text>
                    {method.expiryMonth && method.expiryYear && (
                      <Text style={styles.cardExpiry}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </Text>
                    )}
                  </View>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(method.id)}
                    disabled={isLoading}
                  >
                    <Text style={styles.actionText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleRemovePaymentMethod(method.id, method.isDefault)}
                  disabled={isLoading}
                >
                  <Text style={[styles.actionText, styles.actionTextDanger]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Payment Method Button */}
        <View style={styles.addSection}>
          <Button
            title="+ Add New Payment Method"
            onPress={handleAddPaymentMethod}
            variant="outline"
            size="large"
            style={styles.addButton}
          />
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Quick Actions</Text>
          <View style={styles.helpItems}>
            <TouchableOpacity 
              style={styles.helpItem}
              onPress={() => navigation.navigate('PaymentHistory')}
            >
              <Text style={styles.helpIcon}>📊</Text>
              <Text style={styles.helpText}>Payment History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpIcon}>💬</Text>
              <Text style={styles.helpText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpIcon}>📄</Text>
              <Text style={styles.helpText}>Payment Security</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpItem}>
              <Text style={styles.helpIcon}>❓</Text>
              <Text style={styles.helpText}>FAQ</Text>
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
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: '#d4edda',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: '#155724',
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#6c757d',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  actionTextDanger: {
    color: '#dc3545',
  },
  addSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    width: '100%',
  },
  helpSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  helpItems: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  helpText: {
    fontSize: 15,
    color: '#007AFF',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default PaymentMethodsScreen;

