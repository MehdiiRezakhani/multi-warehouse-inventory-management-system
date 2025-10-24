import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Transfer, Stock } from '@/types';

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
  const transfersPath = path.join(process.cwd(), 'data', 'transfers.json');
  const stockPath = path.join(process.cwd(), 'data', 'stock.json');
  
  if (req.method === 'GET') {
    const jsonData = fs.readFileSync(transfersPath, 'utf-8');
    const transfers: Transfer[] = JSON.parse(jsonData);
    res.status(200).json(transfers);
  } else if (req.method === 'POST') {
    try {
      const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;
      
      if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
      }
      
      if (fromWarehouseId === toWarehouseId) {
        return res.status(400).json({ message: 'Source and destination warehouses must be different' });
      }
      
      const stockData = fs.readFileSync(stockPath, 'utf-8');
      let stock: Stock[] = JSON.parse(stockData);
      
      const sourceStock = stock.find(
        s => s.productId === parseInt(productId) && s.warehouseId === parseInt(fromWarehouseId)
      );
      
      if (!sourceStock) {
        return res.status(400).json({ message: 'Product not found in source warehouse' });
      }
      
      if (sourceStock.quantity < quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${sourceStock.quantity}` 
        });
      }
      
      sourceStock.quantity -= quantity;
      
      let destStock = stock.find(
        s => s.productId === parseInt(productId) && s.warehouseId === parseInt(toWarehouseId)
      );
      
      if (destStock) {
        destStock.quantity += quantity;
      } else {
        const newId = stock.length ? Math.max(...stock.map(s => s.id)) + 1 : 1;
        destStock = {
          id: newId,
          productId: parseInt(productId),
          warehouseId: parseInt(toWarehouseId),
          quantity: quantity,
          lastUpdated: new Date().toISOString()
        };
        stock.push(destStock);
      }
      
      fs.writeFileSync(stockPath, JSON.stringify(stock, null, 2));
      
      const transfersData = fs.readFileSync(transfersPath, 'utf-8');
      let transfers: Transfer[] = JSON.parse(transfersData);
      
      const newTransfer: Transfer = {
        id: transfers.length ? Math.max(...transfers.map(t => t.id)) + 1 : 1,
        productId: parseInt(productId),
        fromWarehouseId: parseInt(fromWarehouseId),
        toWarehouseId: parseInt(toWarehouseId),
        quantity: quantity,
        notes: notes || '',
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      transfers.push(newTransfer);
      fs.writeFileSync(transfersPath, JSON.stringify(transfers, null, 2));
      
      res.status(201).json(newTransfer);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
