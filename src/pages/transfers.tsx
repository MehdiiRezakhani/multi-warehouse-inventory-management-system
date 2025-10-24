import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert as MuiAlert,
  Snackbar,
  CircularProgress,
  Chip,
  useTheme,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AppBarWithToggle from '@/components/AppBarWithToggle';
import { exportTransfersToCSV } from '@/utils/csvExport';
import { Product, Warehouse, Transfer, Stock } from '@/types';

interface FormData {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: string;
  notes: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function Transfers() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  const [formData, setFormData] = useState<FormData>({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: '',
  });
  
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [availableStock, setAvailableStock] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, warehousesRes, transfersRes, stockRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/warehouses'),
        fetch('/api/transfers'),
        fetch('/api/stock'),
      ]);
      
      setProducts(await productsRes.json());
      setWarehouses(await warehousesRes.json());
      setTransfers(await transfersRes.json());
      setStock(await stockRes.json());
      setLoading(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error loading data', severity: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.productId && formData.fromWarehouseId) {
      const stockItem = stock.find(
        s => s.productId === parseInt(formData.productId) && 
             s.warehouseId === parseInt(formData.fromWarehouseId)
      );
      setAvailableStock(stockItem ? stockItem.quantity : 0);
    } else {
      setAvailableStock(0);
    }
  }, [formData.productId, formData.fromWarehouseId, stock]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      setSnackbar({ open: true, message: 'Source and destination must be different', severity: 'error' });
      return;
    }
    
    if (parseInt(formData.quantity) > availableStock) {
      setSnackbar({ open: true, message: `Only ${availableStock} units available`, severity: 'error' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          fromWarehouseId: parseInt(formData.fromWarehouseId),
          toWarehouseId: parseInt(formData.toWarehouseId),
          quantity: parseInt(formData.quantity),
          notes: formData.notes,
        }),
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Transfer completed successfully!', severity: 'success' });
        setFormData({ productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', notes: '' });
        fetchData();
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.message || 'Transfer failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error processing transfer', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  let filteredTransfers = [...transfers];

  if (searchTerm) {
    filteredTransfers = filteredTransfers.filter(transfer => {
      const product = products.find(p => p.id === transfer.productId);
      return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product?.sku.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  if (warehouseFilter !== 'all') {
    filteredTransfers = filteredTransfers.filter(transfer =>
      transfer.fromWarehouseId === parseInt(warehouseFilter) ||
      transfer.toWarehouseId === parseInt(warehouseFilter)
    );
  }

  if (dateFilter !== 'all') {
    const now = new Date();
    filteredTransfers = filteredTransfers.filter(transfer => {
      const transferDate = new Date(transfer.date);
      const daysDiff = Math.floor((now.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') return daysDiff === 0;
      if (dateFilter === 'week') return daysDiff <= 7;
      if (dateFilter === 'month') return daysDiff <= 30;
      return true;
    });
  }

  filteredTransfers.sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'quantity-desc') {
      return b.quantity - a.quantity;
    } else if (sortBy === 'quantity-asc') {
      return a.quantity - b.quantity;
    }
    return 0;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBarWithToggle title="Stock Transfers" icon={SwapHorizIcon} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                  New Transfer
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                    margin="normal"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="From Warehouse"
                    name="fromWarehouseId"
                    value={formData.fromWarehouseId}
                    onChange={handleChange}
                    required
                    margin="normal"
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="To Warehouse"
                    name="toWarehouseId"
                    value={formData.toWarehouseId}
                    onChange={handleChange}
                    required
                    margin="normal"
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  {availableStock > 0 && (
                    <MuiAlert severity="info" sx={{ mt: 2 }}>
                      Available stock: {availableStock} units
                    </MuiAlert>
                  )}
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    margin="normal"
                    slotProps={{ htmlInput: { min: 1, max: availableStock } }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Notes (optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting || !formData.productId || !formData.fromWarehouseId}
                    sx={{ 
                      mt: 3,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Execute Transfer'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Card sx={{
              borderRadius: '20px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Transfer History
                    </Typography>
                    <Chip 
                      icon={<FilterListIcon />} 
                      label={`${filteredTransfers.length} of ${transfers.length}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: '10px', fontWeight: 600 }}
                    />
                  </Box>
                  {transfers.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => exportTransfersToCSV(filteredTransfers, products, warehouses)}
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
                      Export
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search product..."
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
                      label="Warehouse"
                      value={warehouseFilter}
                      onChange={(e) => setWarehouseFilter(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    >
                      <MenuItem value="all">All Warehouses</MenuItem>
                      {warehouses.map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.code}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Date Range"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        }
                      }}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">Last 7 Days</MenuItem>
                      <MenuItem value="month">Last 30 Days</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={6} md={4}>
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
                      <MenuItem value="date-desc">Newest First</MenuItem>
                      <MenuItem value="date-asc">Oldest First</MenuItem>
                      <MenuItem value="quantity-desc">Quantity (High to Low)</MenuItem>
                      <MenuItem value="quantity-asc">Quantity (Low to High)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {filteredTransfers.length === 0 && transfers.length > 0 && (
                  <MuiAlert severity="info" sx={{ mb: 2 }}>
                    No transfers match your filters.
                  </MuiAlert>
                )}

                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell><strong>From</strong></TableCell>
                        <TableCell><strong>To</strong></TableCell>
                        <TableCell align="right"><strong>Qty</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransfers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            {transfers.length === 0 ? 'No transfers yet' : 'No transfers match your filters'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransfers.map((transfer) => {
                          const product = products.find(p => p.id === transfer.productId);
                          const fromWarehouse = warehouses.find(w => w.id === transfer.fromWarehouseId);
                          const toWarehouse = warehouses.find(w => w.id === transfer.toWarehouseId);
                          
                          return (
                            <TableRow key={transfer.id}>
                              <TableCell>
                                {new Date(transfer.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{product?.sku}</TableCell>
                              <TableCell>{fromWarehouse?.code}</TableCell>
                              <TableCell>{toWarehouse?.code}</TableCell>
                              <TableCell align="right">{transfer.quantity}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={transfer.status} 
                                  color="success" 
                                  size="small"
                                  sx={{ borderRadius: '8px', fontWeight: 600 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
