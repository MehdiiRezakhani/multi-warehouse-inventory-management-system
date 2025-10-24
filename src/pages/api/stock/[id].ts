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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ message: 'Invalid stock ID' });
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

    const stockId = parseInt(id);

    if (isNaN(stockId)) {
      res.status(400).json({ message: 'Invalid stock ID format' });
      return;
    }

    if (req.method === 'GET') {
      const stockItem = stock.find((s) => s.id === stockId);
      if (stockItem) {
        res.status(200).json(stockItem);
      } else {
        res.status(404).json({ message: 'Stock item not found' });
      }
    } else if (req.method === 'PUT') {
      const index = stock.findIndex((s) => s.id === stockId);
      if (index !== -1) {
        if (!req.body) {
          res.status(400).json({ message: 'Request body is required' });
          return;
        }

        stock[index] = {
          ...stock[index],
          ...req.body,
          id: stockId
        };

        fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
        res.status(200).json(stock[index]);
      } else {
        res.status(404).json({ message: 'Stock item not found' });
      }
    } else if (req.method === 'DELETE') {
      const index = stock.findIndex((s) => s.id === stockId);
      if (index !== -1) {
        stock.splice(index, 1);
        fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
        res.status(204).end();
      } else {
        res.status(404).json({ message: 'Stock item not found' });
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
