import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SvgIconComponent } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  alpha,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '@/contexts/ThemeContext';

interface AppBarWithToggleProps {
  title: string;
  icon?: SvgIconComponent;
  showNav?: boolean;
}

export default function AppBarWithToggle({ title, icon: Icon, showNav = true }: AppBarWithToggleProps) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Warehouses', href: '/warehouses' },
    { label: 'Stock', href: '/stock' },
    { label: 'Transfers', href: '/transfers' },
    { label: 'Alerts', href: '/alerts' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)' 
          : 'linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
        {Icon && (
          <Box
            sx={{
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: alpha(theme.palette.common.white, 0.15),
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        )}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            letterSpacing: '-0.5px',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          {title}
        </Typography>
        
        {showNav && !isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                color="inherit"
                component={Link}
                href={item.href}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  position: 'relative',
                  background: isActive(item.href) 
                    ? alpha(theme.palette.common.white, 0.15)
                    : 'transparent',
                  '&:hover': {
                    background: alpha(theme.palette.common.white, 0.2),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        
        <IconButton 
          onClick={colorMode.toggleColorMode} 
          color="inherit"
          title={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
              background: alpha(theme.palette.common.white, 0.25),
            },
            transition: 'all 0.2s ease',
          }}
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
