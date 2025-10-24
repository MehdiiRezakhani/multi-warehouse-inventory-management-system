import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    if (!fs.existsSync(filePath)) {
      res.status(500).json({ message: 'Data file not found' });
      return;
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    let products: Product[] = JSON.parse(jsonData);

    if (req.method === 'GET') {
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }

      const newProduct = req.body as Omit<Product, 'id'>;
      
      // Validate required fields
      if (!newProduct.sku || !newProduct.name || !newProduct.category) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const productWithId: Product = {
        ...newProduct,
        id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1
      };
      
      products.push(productWithId);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
      res.status(201).json(productWithId);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
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
