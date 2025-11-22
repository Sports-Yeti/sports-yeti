import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import DataCard from '../../components/DataCard';
import FileUpload, { UploadedFile } from '../../components/FileUpload';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

function SettingsPage() {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@sportsyeti.com',
    phone: '+1-555-0100',
    organization: 'Sports Yeti Admin',
  });

  const [avatar, setAvatar] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  function handleSave() {
    showNotification('success', 'Settings saved successfully!');
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Manage your profile and preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={profileData.organization}
                  onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Avatar Upload */}
            <FileUpload
              mode="single"
              uploadType="avatar"
              maxSize={2}
              label="Profile Picture"
              helperText="Upload a profile picture (JPG, PNG, max 2MB)"
              onFilesChange={setAvatar}
              existingFiles={avatar}
            />

            <Divider sx={{ my: 3 }} />

            {/* Language Selection */}
            <Typography variant="body2" gutterBottom fontWeight={500}>
              Language
            </Typography>
            <LanguageSwitcher />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </DataCard>
        </Grid>

        {/* Documents */}
        <Grid item xs={12} md={4}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FileUpload
              mode="multiple"
              uploadType="document"
              maxSize={10}
              maxFiles={5}
              label="Upload Documents"
              helperText="Certifications, licenses, etc. (max 10MB each)"
              onFilesChange={setDocuments}
              existingFiles={documents}
            />
          </DataCard>
        </Grid>

        {/* League Settings */}
        <Grid item xs={12}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              League Logo & Images
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload images for your leagues, teams, and events
            </Typography>

            <FileUpload
              mode="multiple"
              uploadType="image"
              maxSize={5}
              maxFiles={10}
              label="League & Team Images"
              helperText="Upload logos, banners, and promotional images"
            />
          </DataCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SettingsPage;
