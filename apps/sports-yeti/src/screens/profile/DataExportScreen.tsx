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
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

type DataExportScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'DataExport'
>;

interface Props {
  navigation: DataExportScreenNavigationProp;
}

const EXPORT_TYPES = [
  {
    id: 'profile',
    title: 'Profile Data',
    description: 'Your personal information and settings',
    icon: '👤',
  },
  {
    id: 'games',
    title: 'Game History',
    description: 'All your game records and statistics',
    icon: '🏀',
  },
  {
    id: 'teams',
    title: 'Team Data',
    description: "Teams you've joined and created",
    icon: '👥',
  },
  {
    id: 'transactions',
    title: 'Point Transactions',
    description: 'Complete history of point earnings and spending',
    icon: '💰',
  },
  {
    id: 'bookings',
    title: 'Bookings',
    description: 'Facility and equipment booking history',
    icon: '📅',
  },
  {
    id: 'social',
    title: 'Social Activity',
    description: 'Posts, comments, and interactions',
    icon: '💬',
  },
  {
    id: 'complete',
    title: 'Complete Export',
    description: 'All your data in one file',
    icon: '📦',
  },
];

const DataExportScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const toggleExportType = (typeId: string) => {
    if (typeId === 'complete') {
      // If selecting complete, deselect all others
      setSelectedTypes(['complete']);
    } else {
      // If selecting specific type, remove complete
      const updated = selectedTypes.includes(typeId)
        ? selectedTypes.filter((id) => id !== typeId)
        : [...selectedTypes.filter((id) => id !== 'complete'), typeId];
      setSelectedTypes(updated);
    }
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert(
        'Select Data',
        'Please select at least one data type to export'
      );
      return;
    }

    setIsExporting(true);

    try {
      // TODO: Implement actual data export API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        'Export Complete',
        'Your data has been exported. You will receive a download link via email shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Please try again later');
    } finally {
      setIsExporting(false);
    }
  };

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
          <Text style={styles.title}>Data Export</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Export Your Data</Text>
          <Text style={styles.infoText}>
            In compliance with GDPR and data privacy regulations, you can export
            all your data from Sports Yeti. Select the data types you want to
            export and we'll prepare a downloadable file for you.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select Data to Export</Text>

          {EXPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.exportTypeCard,
                selectedTypes.includes(type.id) &&
                  styles.exportTypeCardSelected,
              ]}
              onPress={() => toggleExportType(type.id)}
            >
              <Text style={styles.exportTypeIcon}>{type.icon}</Text>

              <View style={styles.exportTypeContent}>
                <Text style={styles.exportTypeTitle}>{type.title}</Text>
                <Text style={styles.exportTypeDescription}>
                  {type.description}
                </Text>
              </View>

              {selectedTypes.includes(type.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.formatSection}>
            <Text style={styles.formatTitle}>Export Format</Text>
            <View style={styles.formatOptions}>
              <View style={styles.formatOption}>
                <Text style={styles.formatIcon}>📄</Text>
                <Text style={styles.formatLabel}>JSON</Text>
              </View>
              <Text style={styles.formatDivider}>•</Text>
              <View style={styles.formatOption}>
                <Text style={styles.formatIcon}>📊</Text>
                <Text style={styles.formatLabel}>CSV</Text>
              </View>
              <Text style={styles.formatDivider}>•</Text>
              <View style={styles.formatOption}>
                <Text style={styles.formatIcon}>📋</Text>
                <Text style={styles.formatLabel}>PDF</Text>
              </View>
            </View>
          </View>

          <Button
            title={`Export ${selectedTypes.length} Data ${
              selectedTypes.length === 1 ? 'Type' : 'Types'
            }`}
            onPress={handleExport}
            variant="primary"
            size="large"
            loading={isExporting}
            disabled={selectedTypes.length === 0}
            style={styles.exportButton}
          />

          <View style={styles.noteCard}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={styles.noteText}>
              Your export will be prepared and sent to your email within 24-48
              hours. Large exports may take longer to process.
            </Text>
          </View>
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
  infoCard: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c5460',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  content: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  exportTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  exportTypeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  exportTypeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  exportTypeContent: {
    flex: 1,
  },
  exportTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  exportTypeDescription: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  checkmark: {
    fontSize: 24,
    color: '#007AFF',
  },
  formatSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  formatOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  formatOption: {
    alignItems: 'center',
  },
  formatIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  formatLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  formatDivider: {
    fontSize: 12,
    color: '#6c757d',
  },
  exportButton: {
    marginBottom: 16,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  noteIcon: {
    fontSize: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

export default DataExportScreen;
