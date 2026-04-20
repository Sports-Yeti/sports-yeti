import { useNavigation } from '@react-navigation/native';
import { UIGallery } from '@sports-yeti/ui';
import { PageHeader, PageScroll, type AdminRouteName } from '../../admin';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

/**
 * Live reference for every non-form primitive in @sports-yeti/ui.
 * Sister screen to FormControlsScreen.
 *
 * Sidebar entry: "UI gallery" under "System".
 */
export function UIGalleryScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  return (
    <PageScroll>
      <PageHeader
        title="UI gallery"
        subtitle="Live showcase of every non-form primitive in @sports-yeti/ui — Tag, Skeleton, EmptyState, Tabs, Modal, BottomSheet, Wordmark, OrgAvatar, RoleBadge, SeasonPill, SkillLevelPill, SocialChannelChip."
        crumbs={[{ label: 'System' }, { label: 'UI gallery' }]}
        onNavigate={(r) => navigation.navigate(r)}
      />
      <UIGallery />
    </PageScroll>
  );
}
