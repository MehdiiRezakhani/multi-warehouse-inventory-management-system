import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';

// Disable body parser size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(500).json({ message: 'Data file not found' });
      return;
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    let products: Product[] = JSON.parse(jsonData);

    const productId = parseInt(id);

    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid product ID format' });
      return;
    }

    if (req.method === 'GET') {
      const product = products.find((p) => p.id === productId);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else if (req.method === 'PUT') {
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        // Validate request body
        if (!req.body) {
          res.status(400).json({ message: 'Request body is required' });
          return;
        }

        products[index] = { 
          ...products[index], 
          ...req.body, 
          id: productId 
        };
        
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        res.status(200).json(products[index]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else if (req.method === 'DELETE') {
      const index = products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        products.splice(index, 1);
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        res.status(204).end();
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
