import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AppBarWithToggle from '@/components/AppBarWithToggle';
import { Product } from '@/types';

export default function EditProduct() {
  const [product, setProduct] = useState<Product>({
    id: 0,
    sku: '',
    name: '',
    category: '',
    unitCost: 0,
    reorderPoint: 0,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data: Product) => {
          setProduct(data);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: name === 'unitCost' || name === 'reorderPoint' ? parseFloat(value) || 0 : value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Update failed' }));
        console.error('Update error:', errorData);
        alert(`Error: ${errorData.message || 'Failed to update product'}`);
        return;
      }

      const data = await res.json();
      console.log('Product updated:', data);
      router.push('/products');
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: Failed to update product. Please try again.');
    }
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
      <AppBarWithToggle title="Edit Product" icon={InventoryIcon} />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            Edit Product
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="SKU"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Unit Cost"
              name="unitCost"
              type="number"
              slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
              value={product.unitCost}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Reorder Point"
              name="reorderPoint"
              type="number"
              slotProps={{ htmlInput: { min: '0' } }}
              value={product.reorderPoint}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
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
                Update Product
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/products"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
