import React from 'react';
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
import { getBookingById } from '../../mocks/data';
import Button from '../../components/common/Button';

type BookingDetailsScreenNavigationProp = StackNavigationProp<
  FacilityStackParamList,
  'BookingDetails'
>;
type BookingDetailsScreenRouteProp = RouteProp<
  FacilityStackParamList,
  'BookingDetails'
>;

interface Props {
  navigation: BookingDetailsScreenNavigationProp;
  route: BookingDetailsScreenRouteProp;
}

const BookingDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const booking = getBookingById(bookingId);

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Points will be refunded.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement booking cancellation
            Alert.alert(
              'Booking Cancelled',
              'Your booking has been cancelled and points refunded.'
            );
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
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
          <Text style={styles.title}>Booking Details</Text>
        </View>

        <View style={styles.content}>
          {/* QR Code Display */}
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodePlaceholder}>
              <Text style={styles.qrCodeText}>{booking.qrCode}</Text>
            </View>
            <Text style={styles.qrInstruction}>
              Show this QR code at the facility for check-in
            </Text>
          </View>

          {/* Booking Status */}
          <View style={styles.statusCard}>
            <Text
              style={[
                styles.statusBadge,
                booking.status === 'confirmed' && styles.statusConfirmed,
                booking.status === 'completed' && styles.statusCompleted,
              ]}
            >
              {booking.status.toUpperCase()}
            </Text>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Booking Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Space</Text>
              <Text style={styles.detailValue}>{booking.spaceId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(booking.startTime).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {new Date(booking.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(booking.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabelBold}>Total Cost</Text>
              <Text style={styles.detailValueBold}>
                {booking.pointCost} pts
              </Text>
            </View>
          </View>

          {/* Equipment */}
          {booking.equipmentBookings.length > 0 && (
            <View style={styles.equipmentCard}>
              <Text style={styles.equipmentTitle}>Equipment Included</Text>
              {booking.equipmentBookings.map((equipmentBooking) => (
                <View key={equipmentBooking.id} style={styles.equipmentRow}>
                  <Text style={styles.equipmentName}>
                    {equipmentBooking.equipmentId} x{equipmentBooking.quantity}
                  </Text>
                  <Text style={styles.equipmentCost}>
                    {equipmentBooking.pointCost} pts
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Check-in Status */}
          {booking.checkedIn && booking.checkedInAt && (
            <View style={styles.checkinCard}>
              <Text style={styles.checkinIcon}>✅</Text>
              <Text style={styles.checkinText}>
                Checked in at{' '}
                {new Date(booking.checkedInAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {/* Actions */}
          {booking.status === 'confirmed' && !booking.checkedIn && (
            <View style={styles.actionsContainer}>
              <Button
                title="Cancel Booking"
                onPress={handleCancelBooking}
                variant="danger"
                size="large"
              />
            </View>
          )}
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  qrCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#212529',
    textAlign: 'center',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  statusCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusConfirmed: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusCompleted: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    textAlign: 'right',
  },
  detailLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  detailValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  equipmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  equipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  equipmentName: {
    fontSize: 14,
    color: '#212529',
  },
  equipmentCost: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  checkinIcon: {
    fontSize: 24,
  },
  checkinText: {
    fontSize: 14,
    color: '#155724',
    flex: 1,
  },
  actionsContainer: {
    marginTop: 16,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default BookingDetailsScreen;
