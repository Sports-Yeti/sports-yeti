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
import { FacilityStackParamList } from '../../types';
import { getFacilityById, mockSpaces, mockEquipment } from '../../mocks/data';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type BookFacilityScreenNavigationProp = StackNavigationProp<
  FacilityStackParamList,
  'BookFacility'
>;
type BookFacilityScreenRouteProp = RouteProp<
  FacilityStackParamList,
  'BookFacility'
>;

interface Props {
  navigation: BookFacilityScreenNavigationProp;
  route: BookFacilityScreenRouteProp;
}

const BookFacilityScreen: React.FC<Props> = ({ navigation, route }) => {
  const { facilityId, spaceId } = route.params;
  const { user } = useAuth();
  const facility = getFacilityById(facilityId);
  const space = mockSpaces.find((s) => s.id === spaceId);

  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    selectedEquipmentIds: [] as string[],
    paymentMethod: 'points' as 'points' | 'cash',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.date) {
      newErrors.date = 'Please select a date';
    }

    if (!form.startTime) {
      newErrors.startTime = 'Please select start time';
    }

    if (!form.endTime) {
      newErrors.endTime = 'Please select end time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalCost = () => {
    if (!space) return { points: 0, cash: 0 };

    const spaceCost =
      form.paymentMethod === 'points' ? space.pointCost : space.cashCost;

    const equipmentCost = form.selectedEquipmentIds.reduce(
      (total, equipmentId) => {
        const equipment = mockEquipment.find((e) => e.id === equipmentId);
        if (!equipment) return total;
        return (
          total +
          (form.paymentMethod === 'points'
            ? equipment.pointCost
            : equipment.cashCost)
        );
      },
      0
    );

    return {
      points: form.paymentMethod === 'points' ? spaceCost + equipmentCost : 0,
      cash: form.paymentMethod === 'cash' ? spaceCost + equipmentCost : 0,
    };
  };

  const handleBooking = () => {
    if (!validateForm()) return;

    const totalCost = calculateTotalCost();

    // Check if user has enough points
    if (
      form.paymentMethod === 'points' &&
      user &&
      user.pointBalance < totalCost.points
    ) {
      Alert.alert(
        'Insufficient Points',
        `You need ${totalCost.points} points but only have ${user.pointBalance} points.`
      );
      return;
    }

    // TODO: Implement actual booking API call
    Alert.alert(
      'Booking Confirmed!',
      `Your booking has been confirmed. You will receive a QR code for check-in.`,
      [
        {
          text: 'View QR Code',
          onPress: () => {
            // Navigate to booking details with QR code
            navigation.navigate('BookingDetails', { bookingId: 'booking-new' });
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.navigate('FacilitiesScreen'),
        },
      ]
    );
  };

  const toggleEquipment = (equipmentId: string) => {
    const updated = form.selectedEquipmentIds.includes(equipmentId)
      ? form.selectedEquipmentIds.filter((id) => id !== equipmentId)
      : [...form.selectedEquipmentIds, equipmentId];

    setForm({ ...form, selectedEquipmentIds: updated });
  };

  const totalCost = calculateTotalCost();
  const availableEquipment = mockEquipment.filter(
    (e) => e.facilityId === facilityId && e.available
  );

  if (!facility || !space) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Facility or space not found</Text>
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
          <Text style={styles.title}>Book {space.name}</Text>
          <Text style={styles.subtitle}>{facility.name}</Text>
        </View>

        <View style={styles.content}>
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={form.date}
            onChangeText={(text) => setForm({ ...form, date: text })}
            error={errors.date}
          />

          <View style={styles.timeRow}>
            <Input
              label="Start Time"
              placeholder="HH:MM"
              value={form.startTime}
              onChangeText={(text) => setForm({ ...form, startTime: text })}
              error={errors.startTime}
              style={styles.timeInput}
            />

            <Input
              label="End Time"
              placeholder="HH:MM"
              value={form.endTime}
              onChangeText={(text) => setForm({ ...form, endTime: text })}
              error={errors.endTime}
              style={styles.timeInput}
            />
          </View>

          {/* Equipment Selection */}
          {availableEquipment.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Equipment (Optional)</Text>
              {availableEquipment.map((equipment) => (
                <TouchableOpacity
                  key={equipment.id}
                  style={[
                    styles.equipmentItem,
                    form.selectedEquipmentIds.includes(equipment.id) &&
                      styles.equipmentItemSelected,
                  ]}
                  onPress={() => toggleEquipment(equipment.id)}
                >
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{equipment.name}</Text>
                    <Text style={styles.equipmentPrice}>
                      {form.paymentMethod === 'points'
                        ? `${equipment.pointCost} pts`
                        : `$${equipment.cashCost}`}
                    </Text>
                  </View>
                  {form.selectedEquipmentIds.includes(equipment.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  form.paymentMethod === 'points' &&
                    styles.paymentMethodSelected,
                ]}
                onPress={() => setForm({ ...form, paymentMethod: 'points' })}
              >
                <Text style={styles.paymentMethodIcon}>💰</Text>
                <Text style={styles.paymentMethodTitle}>Points</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Balance: {user?.pointBalance || 0} pts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  form.paymentMethod === 'cash' && styles.paymentMethodSelected,
                ]}
                onPress={() => setForm({ ...form, paymentMethod: 'cash' })}
              >
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <Text style={styles.paymentMethodTitle}>Cash</Text>
                <Text style={styles.paymentMethodSubtitle}>Card payment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cost Summary */}
          <View style={styles.costSummary}>
            <Text style={styles.costTitle}>Cost Summary</Text>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Space rental</Text>
              <Text style={styles.costValue}>
                {form.paymentMethod === 'points'
                  ? `${space.pointCost} pts`
                  : `$${space.cashCost}`}
              </Text>
            </View>

            {form.selectedEquipmentIds.length > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Equipment</Text>
                <Text style={styles.costValue}>
                  {form.paymentMethod === 'points'
                    ? `${totalCost.points - space.pointCost} pts`
                    : `$${totalCost.cash - space.cashCost}`}
                </Text>
              </View>
            )}

            <View style={styles.costDivider} />

            <View style={styles.costRow}>
              <Text style={styles.costTotalLabel}>Total</Text>
              <Text style={styles.costTotalValue}>
                {form.paymentMethod === 'points'
                  ? `${totalCost.points} pts`
                  : `$${totalCost.cash}`}
              </Text>
            </View>
          </View>

          <Button
            title="Confirm Booking"
            onPress={handleBooking}
            variant="primary"
            size="large"
            style={styles.confirmButton}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  equipmentItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  equipmentPrice: {
    fontSize: 12,
    color: '#007AFF',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  paymentMethodSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  paymentMethodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  costSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
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
  confirmButton: {
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

export default BookFacilityScreen;
