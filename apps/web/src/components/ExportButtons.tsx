import { Button, ButtonGroup } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { exportTableData } from '../utils/export';
import { useNotifications } from '../contexts/NotificationContext';

interface ExportButtonsProps<T> {
  data: T[];
  filename: string;
  title?: string;
  columns?: { header: string; dataKey: keyof T }[];
  fields?: string[];
}

function ExportButtons<T extends Record<string, any>>({
  data,
  filename,
  title,
  columns,
  fields,
}: ExportButtonsProps<T>) {
  const { showNotification } = useNotifications();

  const handleExport = (format: 'csv' | 'pdf') => {
    try {
      exportTableData(data, filename, format, { title, columns, fields });
      showNotification('success', `Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      showNotification('error', `Failed to export to ${format.toUpperCase()}`);
    }
  };

  return (
    <ButtonGroup variant="outlined" size="small">
      <Button startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}>
        CSV
      </Button>
      {title && columns && (
        <Button startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
          PDF
        </Button>
      )}
    </ButtonGroup>
  );
}

export default ExportButtons;
