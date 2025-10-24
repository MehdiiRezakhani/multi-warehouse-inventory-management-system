import { Card, CardProps, useTheme, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface StyledCardProps extends CardProps {
  children: ReactNode;
  gradient?: boolean;
  hover?: boolean;
}

export default function StyledCard({ children, gradient = false, hover = true, ...props }: StyledCardProps) {
  const theme = useTheme();

  return (
    <Card
      {...props}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: gradient
          ? theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          : theme.palette.background.paper,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 30px rgba(0, 0, 0, 0.4)'
              : '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </Card>
  );
}
