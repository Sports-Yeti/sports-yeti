import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Paper,
  Avatar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  mode?: 'single' | 'multiple';
  uploadType?: 'avatar' | 'document' | 'image' | 'any';
  onFilesChange?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  label?: string;
  helperText?: string;
}

function FileUpload({
  accept = '*',
  maxSize = 5,
  maxFiles = 10,
  mode = 'multiple',
  uploadType = 'any',
  onFilesChange,
  existingFiles = [],
  label = 'Upload Files',
  helperText,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotifications();

  // Determine accept types based on upload type
  const getAcceptTypes = () => {
    if (accept !== '*') return accept;
    
    switch (uploadType) {
      case 'avatar':
      case 'image':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.xlsx,.xls';
      default:
        return '*';
    }
  };

  function getFileIcon(fileType: string) {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <DocumentIcon />;
    }
    return <FileIcon />;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const fileArray = Array.from(fileList);

    // Check file count
    if (mode === 'single' && fileArray.length > 1) {
      showNotification('warning', 'Only one file can be uploaded');
      return;
    }

    if (files.length + fileArray.length > maxFiles) {
      showNotification('warning', `Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        showNotification('error', `${file.name} exceeds ${maxSize}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Simulate upload
    setUploading(true);
    
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Create blob URL for preview
      uploadedAt: new Date().toISOString(),
    }));

    const newFiles = mode === 'single' ? uploadedFiles : [...files, ...uploadedFiles];
    setFiles(newFiles);
    setUploading(false);

    if (onFilesChange) {
      onFilesChange(newFiles);
    }

    showNotification('success', `${uploadedFiles.length} file(s) uploaded successfully`);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleRemoveFile(fileId: string) {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
    
    showNotification('info', 'File removed');
  }

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  return (
    <Box>
      <Typography variant="body2" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      
      {helperText && (
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {helperText}
        </Typography>
      )}

      {/* Drop Zone */}
      <Paper
        variant="outlined"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          borderStyle: dragActive ? 'solid' : 'dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={(e) => handleFiles(e.target.files)}
          multiple={mode === 'multiple'}
          style={{ display: 'none' }}
        />
        
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="body1" gutterBottom>
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or
        </Typography>
        
        <Button variant="contained" component="span" sx={{ mt: 1 }}>
          Browse Files
        </Button>
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
          Max size: {maxSize}MB • {mode === 'single' ? '1 file' : `Up to ${maxFiles} files`}
        </Typography>
      </Paper>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Uploading...
          </Typography>
        </Box>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {uploadType === 'avatar' && files.length > 0 ? (
            // Avatar preview
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={files[0].url}
                sx={{ width: 80, height: 80 }}
                alt="Avatar preview"
              />
              <Box flex={1}>
                <Typography variant="body2">{files[0].name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(files[0].size)}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleRemoveFile(files[0].id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            // Document list
            <List dense>
              {files.map((file) => (
                <ListItem key={file.id} divider>
                  <ListItemIcon>
                    {file.type.startsWith('image/') ? (
                      <Avatar
                        src={file.url}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}

export default FileUpload;
