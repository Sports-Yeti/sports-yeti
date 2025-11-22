import { useTranslation } from 'react-i18next';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  function handleLanguageChange(event: SelectChangeEvent) {
    i18n.changeLanguage(event.target.value);
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Language</InputLabel>
        <Select
          value={i18n.language}
          label="Language"
          onChange={handleLanguageChange}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Español</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default LanguageSwitcher;
