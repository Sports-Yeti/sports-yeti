// Image Picker Utility
// Helper functions for selecting and uploading images

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { debugLog } from './config';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: 'image' | 'video';
  fileSize?: number;
}

// Request camera permissions
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.'
      );
      return false;
    }

    return true;
  } catch (error) {
    debugLog('Error requesting camera permissions:', error);
    return false;
  }
}

// Request media library permissions
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Media library permission is required to select photos.'
      );
      return false;
    }

    return true;
  } catch (error) {
    debugLog('Error requesting media library permissions:', error);
    return false;
  }
}

// Launch camera to take a photo
export async function takePhoto(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: 'image',
      fileSize: asset.fileSize,
    };
  } catch (error) {
    debugLog('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
}

// Pick image from gallery
export async function pickImage(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: 'image',
      fileSize: asset.fileSize,
    };
  } catch (error) {
    debugLog('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
}

// Pick multiple images
export async function pickMultipleImages(
  maxImages = 5
): Promise<ImagePickerResult[]> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      type: 'image' as const,
      fileSize: asset.fileSize,
    }));
  } catch (error) {
    debugLog('Error picking multiple images:', error);
    Alert.alert('Error', 'Failed to pick images');
    return [];
  }
}

// Show image selection options (Camera or Gallery)
export async function showImagePickerOptions(): Promise<ImagePickerResult | null> {
  return new Promise((resolve) => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const result = await takePhoto();
          resolve(result);
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const result = await pickImage();
          resolve(result);
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(null),
      },
    ]);
  });
}

// Validate image size
export function validateImageSize(fileSize: number, maxSizeMB = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

// Get image file extension from URI
export function getImageExtension(uri: string): string {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : 'jpg';
}

// Convert image to base64 (for upload)
export async function convertImageToBase64(uri: string): Promise<string> {
  // TODO: Implement base64 conversion if needed for API
  throw new Error('Not implemented');
}
