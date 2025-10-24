import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert as MuiAlert,
  useTheme,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AppBarWithToggle from '@/components/AppBarWithToggle';
import { exportAlertsToCSV } from '@/utils/csvExport';
import { Alert } from '@/types';

export default function Alerts() {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alert: Alert) => {
    setSelectedAlert(alert);
    setNotes(alert.notes || '');
    setDialogOpen(true);
  };

  const handleSaveAcknowledgement = async () => {
    if (!selectedAlert) return;
    
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedAlert.productId,
          acknowledged: true,
          notes: notes,
        }),
      });

      setDialogOpen(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  let filteredAlerts = alerts.filter(alert => {
    if (tabValue === 0) return alert.severity === 'critical' && !alert.acknowledged;
    if (tabValue === 1) return alert.status === 'low' && !alert.acknowledged;
    if (tabValue === 2) return alert.status === 'overstocked';
    if (tabValue === 3) return alert.acknowledged;
    return true;
  });

  if (searchTerm) {
    filteredAlerts = filteredAlerts.filter(alert =>
      alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (categoryFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(alert => alert.category === categoryFilter);
  }

  filteredAlerts.sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder: Record<string, number> = { critical: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'stock-asc') {
      return a.currentStock - b.currentStock;
    } else if (sortBy === 'stock-desc') {
      return b.currentStock - a.currentStock;
    } else if (sortBy === 'recommended-desc') {
      return b.recommendedOrder - a.recommendedOrder;
    }
    return 0;
  });

  const categories = [...new Set(alerts.map(a => a.category))];

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const lowCount = alerts.filter(a => a.status === 'low' && !a.acknowledged).length;
  const overstockedCount = alerts.filter(a => a.status === 'overstocked').length;
  const acknowledgedCount = alerts.filter(a => a.acknowledged).length;

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <ErrorIcon color="error" />;
    if (severity === 'medium') return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
  };

  const getSeverityColor = (severity: string): 'error' | 'warning' | 'success' => {
    if (severity === 'critical') return 'error';
    if (severity === 'medium') return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBarWithToggle title="Stock Alerts & Reorder System" icon={NotificationsActiveIcon} />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Inventory Alerts
          </Typography>
          {alerts.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportAlertsToCSV(alerts)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                },
              }}
            >
              Export All Alerts
            </Button>
          )}
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)'
                : 'linear-gradient(135deg, #e53935 0%, #ef5350 100%)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(229, 57, 53, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 48px rgba(229, 57, 53, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  mb: 2,
                }}>
                  <ErrorIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: 500 }}>
                  Critical Alerts
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ my: 1, letterSpacing: '-1px' }}>
                  {criticalCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                  Immediate action required
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #f57c00 0%, #fb8c00 100%)'
                : 'linear-gradient(135deg, #fb8c00 0%, #ffa726 100%)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(251, 140, 0, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 48px rgba(251, 140, 0, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  mb: 2,
                }}>
                  <WarningIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: 500 }}>
                  Low Stock
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ my: 1, letterSpacing: '-1px' }}>
                  {lowCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                  Below reorder point
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 48px rgba(25, 118, 210, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  mb: 2,
                }}>
                  <NotificationsActiveIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: 500 }}>
                  Overstocked
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ my: 1, letterSpacing: '-1px' }}>
                  {overstockedCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                  Above optimal levels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)'
                : 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(67, 160, 71, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 48px rgba(67, 160, 71, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  mb: 2,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: 500 }}>
                  Acknowledged
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ my: 1, letterSpacing: '-1px' }}>
                  {acknowledgedCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                  Being handled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 56,
                },
              }}
            >
              <Tab label={`Critical (${criticalCount})`} />
              <Tab label={`Low Stock (${lowCount})`} />
              <Tab label={`Overstocked (${overstockedCount})`} />
              <Tab label={`Acknowledged (${acknowledgedCount})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  <MenuItem value="severity">Severity (Critical First)</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="stock-asc">Stock (Low to High)</MenuItem>
                  <MenuItem value="stock-desc">Stock (High to Low)</MenuItem>
                  <MenuItem value="recommended-desc">Recommended Order (High to Low)</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {filteredAlerts.length === 0 ? (
              <MuiAlert severity="success">No alerts match your filters</MuiAlert>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={<FilterListIcon />}
                    label={`Showing ${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportAlertsToCSV(filteredAlerts)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Export Current View
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}>
                        <TableCell><strong>Severity</strong></TableCell>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Current Stock</strong></TableCell>
                        <TableCell align="right"><strong>Reorder Point</strong></TableCell>
                        <TableCell align="right"><strong>Recommended Order</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAlerts.map((alert) => (
                        <TableRow key={alert.productId}>
                          <TableCell>{getSeverityIcon(alert.severity)}</TableCell>
                          <TableCell>{alert.sku}</TableCell>
                          <TableCell>{alert.name}</TableCell>
                          <TableCell>{alert.category}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {alert.currentStock}
                          </TableCell>
                          <TableCell align="right">{alert.reorderPoint}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {alert.recommendedOrder > 0 ? alert.recommendedOrder : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.status.replace('_', ' ').toUpperCase()}
                              color={getSeverityColor(alert.severity)}
                              size="small"
                              sx={{ borderRadius: '8px', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            {!alert.acknowledged ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleAcknowledge(alert)}
                                sx={{
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderWidth: '2px',
                                  '&:hover': {
                                    borderWidth: '2px',
                                  },
                                }}
                              >
                                Acknowledge
                              </Button>
                            ) : (
                              <Chip label="Acknowledged" size="small" color="success" sx={{ borderRadius: '8px', fontWeight: 600 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Acknowledge Alert</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Product:</strong> {selectedAlert.name} ({selectedAlert.sku})
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Current Stock:</strong> {selectedAlert.currentStock}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Recommended Order:</strong> {selectedAlert.recommendedOrder} units
              </Typography>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
                placeholder="Add notes about actions taken..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAcknowledgement} 
            variant="contained"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
