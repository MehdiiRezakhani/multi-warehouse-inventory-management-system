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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ message: 'Invalid warehouse ID' });
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

    const warehouseId = parseInt(id);

    if (isNaN(warehouseId)) {
      res.status(400).json({ message: 'Invalid warehouse ID format' });
      return;
    }

    if (req.method === 'GET') {
      const warehouse = warehouses.find((w) => w.id === warehouseId);
      if (warehouse) {
        res.status(200).json(warehouse);
      } else {
        res.status(404).json({ message: 'Warehouse not found' });
      }
    } else if (req.method === 'PUT') {
      const index = warehouses.findIndex((w) => w.id === warehouseId);
      if (index !== -1) {
        if (!req.body) {
          res.status(400).json({ message: 'Request body is required' });
          return;
        }

        warehouses[index] = { 
          ...warehouses[index], 
          ...req.body, 
          id: warehouseId 
        };
        
        fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
        res.status(200).json(warehouses[index]);
      } else {
        res.status(404).json({ message: 'Warehouse not found' });
      }
    } else if (req.method === 'DELETE') {
      const index = warehouses.findIndex((w) => w.id === warehouseId);
      if (index !== -1) {
        warehouses.splice(index, 1);
        fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
        res.status(204).end();
      } else {
        res.status(404).json({ message: 'Warehouse not found' });
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
