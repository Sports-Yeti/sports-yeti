// QR Code Scanner Utility
// Helper functions for QR code scanning and validation

import { Camera } from 'expo-camera';
import { Alert } from 'react-native';
import { debugLog } from './config';

export interface QRCodeResult {
  data: string;
  type: string;
}

// Request camera permissions for QR scanning
export async function requestQRCameraPermissions(): Promise<boolean> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to scan QR codes for check-in.'
      );
      return false;
    }

    return true;
  } catch (error) {
    debugLog('Error requesting QR camera permissions:', error);
    return false;
  }
}

// Validate QR code format
export function validateQRCodeFormat(data: string): boolean {
  // Example format: BK-001-250125-1100
  const qrPattern = /^[A-Z]{2}-\d{3}-\d{6}-\d{4}$/;
  return qrPattern.test(data);
}

// Parse QR code data
export function parseQRCode(data: string): {
  prefix: string;
  bookingNumber: string;
  date: string;
  time: string;
} | null {
  if (!validateQRCodeFormat(data)) {
    return null;
  }

  const [prefix, bookingNumber, date, time] = data.split('-');

  return {
    prefix,
    bookingNumber,
    date,
    time,
  };
}

// Generate QR code data (for bookings)
export function generateQRCodeData(
  type: 'BK' | 'GM' | 'RF', // Booking, Game, Referee
  bookingNumber: string
): string {
  const now = new Date();
  const date = `${now.getFullYear().toString().slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  return `${type}-${bookingNumber}-${date}-${time}`;
}

// Handle QR code scan result
export async function handleQRCodeScan(
  data: string,
  onSuccess: (data: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    debugLog('QR Code scanned:', data);

    // Validate format
    if (!validateQRCodeFormat(data)) {
      const error = 'Invalid QR code format';
      debugLog(error);
      if (onError) {
        onError(error);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not recognized.');
      }
      return;
    }

    // Parse QR code
    const parsed = parseQRCode(data);
    if (!parsed) {
      const error = 'Failed to parse QR code';
      debugLog(error);
      if (onError) {
        onError(error);
      } else {
        Alert.alert('Error', 'Failed to read QR code data.');
      }
      return;
    }

    // TODO: Validate with backend API
    // const validation = await apiValidateQRCode(data);
    // if (!validation.data.valid) {
    //   Alert.alert('Invalid QR Code', 'This QR code is not valid or has expired.');
    //   return;
    // }

    // Success
    onSuccess(data);
  } catch (error) {
    debugLog('QR code scan error:', error);
    if (onError) {
      onError(error instanceof Error ? error.message : 'Unknown error');
    } else {
      Alert.alert('Error', 'Failed to process QR code.');
    }
  }
}

// Check if device has camera
export async function hasCamera(): Promise<boolean> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    debugLog('Error checking camera availability:', error);
    return false;
  }
}
