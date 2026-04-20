import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { UIGallery } from '@sports-yeti/ui';
import { colors, spacing } from '../../theme';
import { Text } from '../../ui';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'UIGallery'>;

/**
 * Live reference for every non-form primitive in @sports-yeti/ui:
 * Tag, Skeleton, EmptyState, Tabs, UIModal, BottomSheet, Wordmark,
 * OrgAvatar, RoleBadge, SeasonPill, SkillLevelPill, SocialChannelChip.
 *
 * Sister screen for form controls is FormControlsScreen.
 */
export function UIGalleryScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          UI Gallery
        </Text>
        <View style={styles.backBtn} />
      </View>
      <UIGallery />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
