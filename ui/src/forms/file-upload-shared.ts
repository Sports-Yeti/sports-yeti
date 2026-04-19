/**
 * Normalized representation of any uploaded asset (image, document,
 * video). Both the native and web implementations of <FileUpload>
 * resolve their picker results into this shape so callers don't need
 * to know which platform produced the file.
 */
export interface UploadedFile {
  /** Local URI (file://, content://, or blob: on web). */
  uri: string;
  /** Original filename. May be undefined on native image picker. */
  name?: string;
  /** MIME type, when known. */
  mimeType?: string;
  /** Size in bytes, when known. */
  size?: number;
  /** Width in pixels for images/video. */
  width?: number;
  /** Height in pixels for images/video. */
  height?: number;
  /** Platform-specific original payload (DocumentPicker asset, ImagePicker
   *  asset, or HTML File). Useful when callers need to read the raw bytes. */
  raw?: unknown;
}

export type AcceptedKind =
  | 'image'
  | 'video'
  | 'document'
  | 'any';

export interface FileUploadProps {
  /** Currently-selected files. */
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** What kind of files to allow. Mobile pickers translate this into
   *  expo-image-picker (image/video) or expo-document-picker (document/any). */
  accept?: AcceptedKind;
  /** Hard cap on number of files. When `multiple` is false, this is treated as 1. */
  multiple?: boolean;
  maxFiles?: number;
  /** Max bytes per file. Files exceeding this raise the `error` slot in
   *  the wrapping FormField if validation hooks are wired up. */
  maxSize?: number;
  disabled?: boolean;
  /** Optional standalone label (ignored in FormField). */
  label?: string;
  /** Optional standalone error (ignored in FormField). */
  error?: string;
  helpText?: string;
  /** Called when the user removes a file (X button on a chip). */
  onRemove?: (file: UploadedFile, index: number) => void;
}
