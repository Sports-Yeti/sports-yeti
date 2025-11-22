import { Paper } from '@mui/material';
import { ReactNode } from 'react';

interface DataCardProps {
  children: ReactNode;
  sx?: object;
}

function DataCard({ children, sx }: DataCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 3, ...sx }}>
      {children as any}
    </Paper>
  );
}

export default DataCard;
