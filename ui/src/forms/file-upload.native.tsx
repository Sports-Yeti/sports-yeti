import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { useFormFieldContext } from './form-field-context';
import { ws } from '../primitives/pressable';
import type {
  AcceptedKind,
  FileUploadProps,
  UploadedFile,
} from './file-upload-shared';

export type { FileUploadProps, UploadedFile, AcceptedKind } from './file-upload-shared';

/**
 * Native (iOS/Android) file picker:
 *   - 'image' / 'video' → expo-image-picker
 *   - 'document' / 'any' → expo-document-picker
 *
 * Web equivalent lives in file-upload.tsx (hidden <input> + drag-and-drop).
 */
export function FileUpload({
  value,
  onChange,
  accept = 'any',
  multiple = false,
  maxFiles,
  maxSize,
  disabled = false,
  label,
  error,
  helpText,
  onRemove,
}: FileUploadProps) {
  const { colors, spacing, radii } = useTheme();
  const fieldCtx = useFormFieldContext();
  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;

  const append = (next: UploadedFile[]) => {
    const merged = multiple ? [...value, ...next] : next.slice(0, 1);
    const capped = maxFiles ? merged.slice(0, maxFiles) : merged;
    const filtered = maxSize
      ? capped.filter((f) => (f.size ?? 0) <= maxSize)
      : capped;
    onChange(filtered);
  };

  const pickImageOrVideo = async (kind: 'image' | 'video') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        kind === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple,
      selectionLimit: maxFiles ?? 0,
      quality: 0.9,
    });
    if (result.canceled) return;
    const mapped: UploadedFile[] = result.assets.map((a) => ({
      uri: a.uri,
      name: a.fileName ?? undefined,
      mimeType: a.mimeType ?? undefined,
      size: a.fileSize ?? undefined,
      width: a.width,
      height: a.height,
      raw: a,
    }));
    append(mapped);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const mapped: UploadedFile[] = result.assets.map((a) => ({
      uri: a.uri,
      name: a.name,
      mimeType: a.mimeType ?? undefined,
      size: a.size,
      raw: a,
    }));
    append(mapped);
  };

  const handlePick = () => {
    if (resolvedDisabled) return;
    if (accept === 'image') void pickImageOrVideo('image');
    else if (accept === 'video') void pickImageOrVideo('video');
    else void pickDocument();
  };

  const handleRemove = (file: UploadedFile, index: number) => {
    onRemove?.(file, index);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <View style={{ width: '100%' }}>
      {!fieldCtx && label ? (
        <UIText
          variant="eyebrow"
          color={colors.text.secondary}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </UIText>
      ) : null}

      <Pressable
        onPress={handlePick}
        disabled={resolvedDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          fieldCtx?.hasLabel ? undefined : label ?? 'Upload file'
        }
        accessibilityLabelledBy={
          fieldCtx?.hasLabel ? fieldCtx.labelId : undefined
        }
        accessibilityState={{ disabled: resolvedDisabled }}
        aria-invalid={isInvalid || undefined}
      >
        {(state) => {
          const { hovered } = ws(state);
          return (
            <View
              style={[
                styles.dropzone,
                {
                  borderColor: isInvalid
                    ? colors.status.error
                    : hovered
                    ? colors.brand.primary
                    : colors.border.strong,
                  backgroundColor: colors.surface.card,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  gap: spacing.sm,
                  opacity: resolvedDisabled ? 0.6 : 1,
                },
              ]}
            >
              <Upload size={20} color={colors.brand.primary} strokeWidth={2.25} />
              <UIText variant="body" color={colors.text.primary} align="center">
                {accept === 'image'
                  ? 'Choose from library'
                  : accept === 'video'
                  ? 'Choose video'
                  : 'Choose file'}
              </UIText>
              <UIText variant="caption" color={colors.text.muted} align="center">
                {hintFor(accept, multiple, maxSize)}
              </UIText>
            </View>
          );
        }}
      </Pressable>

      {value.length > 0 ? (
        <View style={[styles.fileList, { marginTop: spacing.sm, gap: spacing.xs }]}>
          {value.map((f, i) => (
            <View
              key={`${f.uri}-${i}`}
              style={[
                styles.fileChip,
                {
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: colors.surface.chipMuted,
                  gap: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <UIText
                  variant="bodySm"
                  color={colors.text.primary}
                  numberOfLines={1}
                >
                  {f.name ?? f.uri}
                </UIText>
                {f.size != null ? (
                  <UIText variant="caption" color={colors.text.muted}>
                    {formatBytes(f.size)}
                  </UIText>
                ) : null}
              </View>
              <Pressable
                onPress={() => handleRemove(f, i)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${f.name ?? 'file'}`}
                hitSlop={6}
                style={styles.removeBtn}
              >
                <X size={14} color={colors.text.secondary} strokeWidth={2.25} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {!fieldCtx && error ? (
        <UIText
          variant="caption"
          color={colors.status.error}
          accessibilityLiveRegion="polite"
          style={{ marginTop: spacing.xs }}
        >
          {error}
        </UIText>
      ) : !fieldCtx && helpText ? (
        <UIText
          variant="caption"
          color={colors.text.secondary}
          style={{ marginTop: spacing.xs }}
        >
          {helpText}
        </UIText>
      ) : null}
    </View>
  );
}

function hintFor(accept: AcceptedKind, multiple: boolean, maxSize?: number) {
  const what =
    accept === 'image'
      ? 'Photos'
      : accept === 'video'
      ? 'Videos'
      : accept === 'document'
      ? 'Documents'
      : 'Any file';
  const count = multiple ? 'multiple' : 'single';
  const size = maxSize ? ` · up to ${formatBytes(maxSize)}` : '';
  return `${what} · ${count}${size}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const styles = StyleSheet.create({
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  fileList: {
    width: '100%',
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
