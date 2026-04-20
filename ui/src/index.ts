// Theme contract + provider
export {
  UIThemeProvider,
  useTheme,
  useTokens,
  useDensityValue,
} from './theme/provider';
export type { UIThemeProviderProps } from './theme/provider';
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeRadii,
  ThemeShadows,
  ThemeTypography,
  ThemeDensity,
  SharedTextVariant,
} from './theme/types';

// Per-org branding helper — merges an org's brand color into the active theme
export { mergeThemeWithBrand } from './theme/merge-brand';
export type { OrgBrandLike } from './theme/merge-brand';

// Cross-platform primitives
export { ws } from './primitives/pressable';
export type { WebPressableState } from './primitives/pressable';
export { usePrefixedId } from './primitives/id';

// Internal text helper used by form controls
export { UIText } from './text/ui-text';
export type { UITextProps } from './text/ui-text';

// Form controls + hooks
export * from './forms';

// Display primitives (cross-app)
export { Tag } from './display/tag';
export type { TagProps, TagTone, TagSize } from './display/tag';
export { Skeleton } from './display/skeleton';
export type { SkeletonProps, SkeletonVariant } from './display/skeleton';
export { EmptyState } from './display/empty-state';
export type { EmptyStateProps, EmptyStateAction } from './display/empty-state';

// Layout primitives (cross-app)
export { Tabs } from './layout/tabs';
export type { TabsProps, TabItem, TabsVariant } from './layout/tabs';
export { UIModal } from './layout/modal';
export type { UIModalProps, ModalVariant, ModalAction } from './layout/modal';
export { BottomSheet } from './layout/bottom-sheet';
export type { BottomSheetProps } from './layout/bottom-sheet';

// Branding primitives
export { Wordmark } from './branding/wordmark';
export type { WordmarkProps, WordmarkSize } from './branding/wordmark';
export { OrgAvatar } from './branding/org-avatar';
export type { OrgAvatarProps, OrgAvatarSize } from './branding/org-avatar';
export { RoleBadge } from './branding/role-badge';
export type { RoleBadgeProps } from './branding/role-badge';
export { SeasonPill } from './branding/season-pill';
export type { SeasonPillProps } from './branding/season-pill';
export { SkillLevelPill } from './branding/skill-level-pill';
export type { SkillLevelPillProps } from './branding/skill-level-pill';
export { SocialChannelChip } from './branding/social-channel-chip';
export type {
  SocialChannelChipProps,
  SocialChannel,
} from './branding/social-channel-chip';

// Dev-only — live gallery of every form primitive + non-form primitive.
// Drop into any screen to verify the design system end-to-end.
export { FormControlsGallery } from './dev/form-controls-gallery';
export { UIGallery } from './dev/ui-gallery';
