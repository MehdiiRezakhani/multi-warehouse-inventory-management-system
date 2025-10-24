import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Stock } from '@/types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'stock.json');
    
    if (!fs.existsSync(filePath)) {
      res.status(500).json({ message: 'Data file not found' });
      return;
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    let stock: Stock[] = JSON.parse(jsonData);

    if (req.method === 'GET') {
      res.status(200).json(stock);
    } else if (req.method === 'POST') {
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }

      const newStock = req.body as Omit<Stock, 'id'>;
      
      if (!newStock.productId || !newStock.warehouseId || newStock.quantity === undefined) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const stockWithId: Stock = {
        ...newStock,
        id: stock.length ? Math.max(...stock.map(s => s.id)) + 1 : 1
      };
      
      stock.push(stockWithId);
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
      res.status(201).json(stockWithId);
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
