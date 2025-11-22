import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import { FacilityStackParamList } from '../../types';
import {
  requestQRCameraPermissions,
  handleQRCodeScan,
} from '../../utils/qrCodeScanner';
import Button from '../../components/common/Button';

type QRScannerScreenNavigationProp = StackNavigationProp<
  FacilityStackParamList,
  'QRScanner'
>;

interface Props {
  navigation: QRScannerScreenNavigationProp;
}

const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const granted = await requestQRCameraPermissions();
    setHasPermission(granted);
  };

  const onBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    handleQRCodeScan(
      data,
      (qrData) => {
        // Success
        Alert.alert(
          'Check-in Successful!',
          `You have checked in with code: ${qrData}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      },
      (error) => {
        // Error
        setScanned(false);
        Alert.alert('Error', error);
      }
    );
  };

  const simulateScan = () => {
    // Simulate scanning a QR code for testing
    onBarCodeScanned({ type: 'qr', data: 'BK-001-250125-1100' });
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>
            Camera permission is required to scan QR codes
          </Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
      </View>

      <View style={styles.scannerContainer}>
        {/* Real Camera View for QR Scanning */}
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : onBarCodeScanned}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>

          {scanned && (
            <Button
              title="Scan Again"
              onPress={() => setScanned(false)}
              variant="primary"
              size="medium"
              style={styles.scanAgainButton}
            />
          )}

          {/* Simulate button for testing without camera */}
          <Button
            title="Simulate Scan (Testing)"
            onPress={simulateScan}
            variant="outline"
            size="small"
            style={styles.simulateButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanAgainButton: {
    marginBottom: 12,
    minWidth: 150,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  simulateButton: {
    minWidth: 250,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default QRScannerScreen;
