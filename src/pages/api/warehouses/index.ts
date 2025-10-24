import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Warehouse } from '@/types';

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
    const filePath = path.join(process.cwd(), 'data', 'warehouses.json');
    
    if (!fs.existsSync(filePath)) {
      res.status(500).json({ message: 'Data file not found' });
      return;
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    let warehouses: Warehouse[] = JSON.parse(jsonData);

    if (req.method === 'GET') {
      res.status(200).json(warehouses);
    } else if (req.method === 'POST') {
      if (!req.body) {
        res.status(400).json({ message: 'Request body is required' });
        return;
      }

      const newWarehouse = req.body as Omit<Warehouse, 'id'>;
      
      if (!newWarehouse.name || !newWarehouse.location || !newWarehouse.code) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const warehouseWithId: Warehouse = {
        ...newWarehouse,
        id: warehouses.length ? Math.max(...warehouses.map(w => w.id)) + 1 : 1
      };
      
      warehouses.push(warehouseWithId);
      fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
      res.status(201).json(warehouseWithId);
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
