import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
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
  Alert,
  useTheme,
  useMediaQuery,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppBarWithToggle from '@/components/AppBarWithToggle';
import { exportInventoryToCSV } from '@/utils/csvExport';
import { Product, Warehouse, Stock, Alert as AlertType } from '@/types';

interface InventoryItem extends Product {
  totalQuantity: number;
  status: string;
  severity: string;
}

interface CategoryData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface WarehouseData {
  name: string;
  items: number;
  value: number;
  [key: string]: string | number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('severity');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/warehouses').then(res => res.json()),
      fetch('/api/stock').then(res => res.json()),
      fetch('/api/alerts').then(res => res.json()),
    ])
      .then(([productsData, warehousesData, stockData, alertsData]) => {
        setProducts(productsData);
        setWarehouses(warehousesData);
        setStock(stockData);
        setAlerts(alertsData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalValue = stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.unitCost * item.quantity : 0);
  }, 0);

  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0);
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const lowStockAlerts = alerts.filter(a => a.status === 'low' && !a.acknowledged).length;

  let inventoryOverview: InventoryItem[] = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const alert = alerts.find(a => a.productId === product.id);
    return {
      ...product,
      totalQuantity,
      status: alert?.status || 'adequate',
      severity: alert?.severity || 'low',
    };
  });

  if (searchTerm) {
    inventoryOverview = inventoryOverview.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (categoryFilter !== 'all') {
    inventoryOverview = inventoryOverview.filter(item => item.category === categoryFilter);
  }

  if (statusFilter !== 'all') {
    inventoryOverview = inventoryOverview.filter(item => item.status === statusFilter);
  }

  inventoryOverview.sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder: Record<string, number> = { critical: 0, out_of_stock: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'stock-asc') {
      return a.totalQuantity - b.totalQuantity;
    } else if (sortBy === 'stock-desc') {
      return b.totalQuantity - a.totalQuantity;
    } else if (sortBy === 'sku') {
      return a.sku.localeCompare(b.sku);
    }
    return 0;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const categoryData: CategoryData[] = products.reduce((acc: CategoryData[], product) => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += totalQuantity;
    } else {
      acc.push({ name: product.category, value: totalQuantity });
    }
    return acc;
  }, []);

  const warehouseData: WarehouseData[] = warehouses.map(warehouse => {
    const warehouseStock = stock.filter(s => s.warehouseId === warehouse.id);
    const totalQuantity = warehouseStock.reduce((sum, s) => sum + s.quantity, 0);
    const value = warehouseStock.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.unitCost * item.quantity : 0);
    }, 0);
    return {
      name: warehouse.code,
      items: totalQuantity,
      value: parseFloat(value.toFixed(2)),
    };
  });

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <AppBarWithToggle title="GreenSupply Co" icon={InventoryIcon} />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" fontWeight={700} color="primary">
            Inventory Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportInventoryToCSV(products, stock, warehouses)}
              size={isMobile ? "small" : "medium"}
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
              Export CSV
            </Button>
            {criticalAlerts > 0 && (
              <Chip 
                icon={<WarningIcon />} 
                label={`${criticalAlerts} Critical Alert${criticalAlerts > 1 ? 's' : ''}`}
                color="error"
                component={Link}
                href="/alerts"
                clickable
                sx={{ borderRadius: '10px', fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontSize: '0.875rem', fontWeight: 500 }}>
                  Total Value
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: '-1px' }}>
                  ${totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <InventoryIcon sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontSize: '0.875rem', fontWeight: 500 }}>
                  Total Items
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: '-1px' }}>
                  {totalItems.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <WarehouseIcon sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontSize: '0.875rem', fontWeight: 500 }}>
                  Warehouses
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: '-1px' }}>
                  {warehouses.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              background: criticalAlerts > 0 
                ? (theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)' 
                  : 'linear-gradient(135deg, #e53935 0%, #ef5350 100%)')
                : (theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #6a1b9a 0%, #7b1fa2 100%)' 
                  : 'linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%)'), 
              color: 'white',
              borderRadius: '20px',
              border: 'none',
              boxShadow: criticalAlerts > 0 
                ? '0 8px 32px rgba(229, 57, 53, 0.3)'
                : '0 8px 32px rgba(142, 36, 170, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: criticalAlerts > 0 
                  ? '0 12px 48px rgba(229, 57, 53, 0.4)'
                  : '0 12px 48px rgba(142, 36, 170, 0.4)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <NotificationsActiveIcon sx={{ fontSize: 28 }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontSize: '0.875rem', fontWeight: 500 }}>
                  Active Alerts
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: '-1px' }}>
                  {criticalAlerts + lowStockAlerts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                  Stock by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                  Warehouse Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={warehouseData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2196f3" />
                    <YAxis yAxisId="right" orientation="right" stroke="#4caf50" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="items" fill="#2196f3" name="Items" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="value" fill="#4caf50" name="Value ($)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<SwapHorizIcon />}
              component={Link}
              href="/transfers"
              sx={{ 
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Transfer Stock
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              color="warning"
              startIcon={<NotificationsActiveIcon />}
              component={Link}
              href="/alerts"
              sx={{ 
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(237, 108, 2, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(237, 108, 2, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              View Alerts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined"
              startIcon={<CategoryIcon />}
              component={Link}
              href="/products"
              sx={{ 
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth 
              variant="outlined"
              startIcon={<WarehouseIcon />}
              component={Link}
              href="/warehouses"
              sx={{ 
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Manage Warehouses
            </Button>
          </Grid>
        </Grid>

        <Card sx={{ 
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Inventory Overview
              </Typography>
              <Chip 
                icon={<FilterListIcon />} 
                label={`${inventoryOverview.length} of ${products.length} items`}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: '10px', fontWeight: 600 }}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
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
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  <MenuItem value="low">Low Stock</MenuItem>
                  <MenuItem value="adequate">Adequate</MenuItem>
                  <MenuItem value="overstocked">Overstocked</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
                  <MenuItem value="sku">SKU (A-Z)</MenuItem>
                  <MenuItem value="stock-asc">Stock (Low to High)</MenuItem>
                  <MenuItem value="stock-desc">Stock (High to Low)</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {inventoryOverview.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No items match your filters. Try adjusting your search criteria.
              </Alert>
            )}

            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}>
                    <TableCell><strong>SKU</strong></TableCell>
                    {!isMobile && <TableCell><strong>Product Name</strong></TableCell>}
                    {!isTablet && <TableCell><strong>Category</strong></TableCell>}
                    <TableCell align="right"><strong>Stock</strong></TableCell>
                    {!isMobile && <TableCell align="right"><strong>Reorder</strong></TableCell>}
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryOverview.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.sku}</TableCell>
                      {!isMobile && <TableCell>{item.name}</TableCell>}
                      {!isTablet && <TableCell>{item.category}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{item.totalQuantity}</TableCell>
                      {!isMobile && <TableCell align="right">{item.reorderPoint}</TableCell>}
                      <TableCell>
                        {item.status === 'critical' || item.status === 'out_of_stock' ? (
                          <Chip label={item.status === 'out_of_stock' ? 'Out' : 'Critical'} color="error" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} />
                        ) : item.status === 'low' ? (
                          <Chip label="Low" color="warning" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} />
                        ) : item.status === 'overstocked' ? (
                          <Chip label="High" color="info" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} />
                        ) : (
                          <Chip label="OK" color="success" size="small" sx={{ borderRadius: '8px', fontWeight: 600 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
