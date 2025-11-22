import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color = 'primary.main', subtitle }: StatCardProps) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box component="div" sx={{ color, fontSize: 40, opacity: 0.7 }}>{icon as any}</Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;
