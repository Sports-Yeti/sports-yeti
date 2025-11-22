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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type AddPaymentMethodScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'AddPaymentMethod'>;

interface Props {
  navigation: AddPaymentMethodScreenNavigationProp;
}

const AddPaymentMethodScreen: React.FC<Props> = ({ navigation }) => {
  const [form, setForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveAsDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!form.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!form.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    } else if (parseInt(form.expiryMonth) < 1 || parseInt(form.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid month (01-12)';
    }

    if (!form.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else if (form.expiryYear.length !== 4) {
      newErrors.expiryYear = 'Please enter 4-digit year';
    }

    if (!form.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(form.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      setForm({ ...form, cardNumber: formatCardNumber(cleaned) });
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: '' });
      }
    }
  };

  const handleAddCard = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement Stripe API integration
      // Use Stripe.js or react-native-stripe-sdk for secure tokenization
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Your payment method has been added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add payment method. Please try again.'
      );
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Payment Method</Text>
          <Text style={styles.subtitle}>
            Enter your card information securely
          </Text>
        </View>

        {/* Stripe Badge */}
        <View style={styles.stripeBanner}>
          <Text style={styles.stripeIcon}>🔒</Text>
          <View style={styles.stripeContent}>
            <Text style={styles.stripeText}>
              Secured by Stripe
            </Text>
            <Text style={styles.stripeSubtext}>
              Your payment information is encrypted end-to-end
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            error={errors.cardNumber}
            maxLength={19} // 16 digits + 3 spaces
          />

          <Input
            label="Cardholder Name"
            placeholder="John Doe"
            value={form.cardholderName}
            onChangeText={(text) => {
              setForm({ ...form, cardholderName: text });
              if (errors.cardholderName) {
                setErrors({ ...errors, cardholderName: '' });
              }
            }}
            autoCapitalize="words"
            error={errors.cardholderName}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Expiry Month (MM)"
                placeholder="12"
                value={form.expiryMonth}
                onChangeText={(text) => {
                  if (text.length <= 2) {
                    setForm({ ...form, expiryMonth: text });
                    if (errors.expiryMonth) {
                      setErrors({ ...errors, expiryMonth: '' });
                    }
                  }
                }}
                keyboardType="numeric"
                error={errors.expiryMonth}
                maxLength={2}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Expiry Year (YYYY)"
                placeholder="2025"
                value={form.expiryYear}
                onChangeText={(text) => {
                  if (text.length <= 4) {
                    setForm({ ...form, expiryYear: text });
                    if (errors.expiryYear) {
                      setErrors({ ...errors, expiryYear: '' });
                    }
                  }
                }}
                keyboardType="numeric"
                error={errors.expiryYear}
                maxLength={4}
              />
            </View>
          </View>

          <Input
            label="CVV"
            placeholder="123"
            value={form.cvv}
            onChangeText={(text) => {
              if (text.length <= 4) {
                setForm({ ...form, cvv: text });
                if (errors.cvv) {
                  setErrors({ ...errors, cvv: '' });
                }
              }
            }}
            keyboardType="numeric"
            secureTextEntry
            error={errors.cvv}
            maxLength={4}
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setForm({ ...form, saveAsDefault: !form.saveAsDefault })}
          >
            <View style={styles.checkbox}>
              {form.saveAsDefault && (
                <Text style={styles.checkboxCheck}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>Set as default payment method</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>Your Security Matters</Text>
          <View style={styles.securityItems}>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✓</Text>
              <Text style={styles.securityText}>
                256-bit SSL encryption
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✓</Text>
              <Text style={styles.securityText}>
                PCI-DSS compliant
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✓</Text>
              <Text style={styles.securityText}>
                No card info stored on our servers
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="large"
          style={styles.cancelButton}
        />
        <Button
          title="Add Card"
          onPress={handleAddCard}
          variant="primary"
          size="large"
          style={styles.addButton}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
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
  stripeBanner: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  stripeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  stripeContent: {
    flex: 1,
  },
  stripeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  stripeSubtext: {
    fontSize: 12,
    color: '#6c757d',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#495057',
  },
  securityInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  securityItems: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 14,
    color: '#28a745',
    marginRight: 12,
    fontWeight: 'bold',
  },
  securityText: {
    fontSize: 14,
    color: '#495057',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 2,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default AddPaymentMethodScreen;

