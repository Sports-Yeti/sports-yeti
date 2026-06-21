import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Upload, X } from 'lucide-react-native';
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

const ACCEPT_ATTRS: Record<AcceptedKind, string | undefined> = {
  image: 'image/*',
  video: 'video/*',
  document: '.pdf,.doc,.docx,.csv,.txt,.xlsx,.xls,.ppt,.pptx',
  any: undefined,
};

/**
 * Web implementation: hidden <input type="file"> + a drag-and-drop zone.
 * Native (.native.tsx) overrides to use expo-image-picker / expo-document-picker.
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const resolvedDisabled = disabled || fieldCtx?.isDisabled === true;
  const isInvalid = fieldCtx?.isInvalid ?? !!error;

  const ingest = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      const accepted = incoming.filter((f) => {
        if (maxSize && f.size > maxSize) return false;
        return true;
      });
      const mapped: UploadedFile[] = accepted.map((f) => ({
        uri: typeof URL !== 'undefined' ? URL.createObjectURL(f) : '',
        name: f.name,
        mimeType: f.type,
        size: f.size,
        raw: f,
      }));
      const next = multiple ? [...value, ...mapped] : mapped.slice(0, 1);
      const capped = maxFiles ? next.slice(0, maxFiles) : next;
      onChange(capped);
    },
    [maxSize, multiple, value, maxFiles, onChange],
  );

  const handleSelect = () => {
    if (resolvedDisabled) return;
    inputRef.current?.click();
  };

  const handleRemove = (file: UploadedFile, index: number) => {
    onRemove?.(file, index);
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  // Web-only DnD handlers attached via dynamic span-style props.
  const dndProps =
    typeof window === 'undefined'
      ? {}
      : ({
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            if (!resolvedDisabled) setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (resolvedDisabled) return;
            if (e.dataTransfer?.files?.length) ingest(e.dataTransfer.files);
          },
        } as unknown as { [key: string]: unknown });

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
        onPress={handleSelect}
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
        // Spread DnD handlers onto the dropzone Pressable on web.
        {...(dndProps as Record<string, unknown>)}
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
                    : dragOver || hovered
                    ? colors.brand.primary
                    : colors.border.strong,
                  backgroundColor: dragOver
                    ? colors.brand.soft
                    : colors.surface.card,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  gap: spacing.sm,
                  opacity: resolvedDisabled ? 0.6 : 1,
                },
              ]}
            >
              <Upload size={20} color={colors.brand.primary} strokeWidth={2.25} />
              <UIText variant="body" color={colors.text.primary} align="center">
                Click or drop files here
              </UIText>
              <UIText variant="caption" color={colors.text.muted} align="center">
                {hintFor(accept, multiple, maxSize)}
              </UIText>
            </View>
          );
        }}
      </Pressable>

      {/* Hidden native file input — only rendered on web (no JSX type for
          DOM input in RN, so we go through a type cast). */}
      {typeof document !== 'undefined'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (React.createElement as any)('input', {
            ref: inputRef,
            type: 'file',
            multiple,
            accept: ACCEPT_ATTRS[accept],
            disabled: resolvedDisabled,
            style: { display: 'none' },
            onChange: (e: { target: { files: FileList | null } }) => {
              if (e.target.files) ingest(e.target.files);
              if (inputRef.current) inputRef.current.value = '';
            },
          })
        : null}

      {value.length > 0 ? (
        <View style={[styles.fileList, { marginTop: spacing.sm, gap: spacing.xs }]}>
          {value.map((f, i) => (
            <FileChip
              key={`${f.uri}-${i}`}
              file={f}
              onRemove={() => handleRemove(f, i)}
            />
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

interface FileChipProps {
  file: UploadedFile;
  onRemove: () => void;
}

function FileChip({ file, onRemove }: FileChipProps) {
  const { colors, spacing, radii } = useTheme();
  return (
    <View
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
        <UIText variant="bodySm" color={colors.text.primary} numberOfLines={1}>
          {file.name ?? file.uri}
        </UIText>
        {file.size != null ? (
          <UIText variant="caption" color={colors.text.muted}>
            {formatBytes(file.size)}
          </UIText>
        ) : null}
      </View>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${file.name ?? 'file'}`}
        hitSlop={6}
        style={styles.removeBtn}
      >
        <X size={14} color={colors.text.secondary} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

function hintFor(
  accept: AcceptedKind,
  multiple: boolean,
  maxSize?: number,
): string {
  const what =
    accept === 'image'
      ? 'Images'
      : accept === 'video'
      ? 'Videos'
      : accept === 'document'
      ? 'Documents'
      : 'Any file';
  const count = multiple ? 'files' : 'a single file';
  const size = maxSize ? ` · up to ${formatBytes(maxSize)} each` : '';
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
    minHeight: 140,
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
