import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Product, Stock } from '@/types';

interface AlertData {
  productId: number;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  notes: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const alertsPath = path.join(process.cwd(), 'data', 'alerts.json');
  const productsPath = path.join(process.cwd(), 'data', 'products.json');
  const stockPath = path.join(process.cwd(), 'data', 'stock.json');
  
  if (req.method === 'GET') {
    try {
      const products: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const stock: Stock[] = JSON.parse(fs.readFileSync(stockPath, 'utf-8'));
      const alerts: AlertData[] = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
      
      const alertsData = products.map(product => {
        const productStock = stock.filter(s => s.productId === product.id);
        const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
        
        let status: 'critical' | 'out_of_stock' | 'low' | 'adequate' | 'overstocked' = 'adequate';
        let severity: 'critical' | 'medium' | 'low' = 'low';
        
        if (totalQuantity === 0) {
          status = 'out_of_stock';
          severity = 'critical';
        } else if (totalQuantity < product.reorderPoint * 0.5) {
          status = 'critical';
          severity = 'critical';
        } else if (totalQuantity < product.reorderPoint) {
          status = 'low';
          severity = 'medium';
        } else if (totalQuantity > product.reorderPoint * 3) {
          status = 'overstocked';
          severity = 'low';
        }
        
        const existingAlert = alerts.find(a => a.productId === product.id);
        const recommendedOrder = Math.max(0, (product.reorderPoint * 2) - totalQuantity);
        
        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          currentStock: totalQuantity,
          reorderPoint: product.reorderPoint,
          status,
          severity,
          recommendedOrder,
          acknowledged: existingAlert?.acknowledged || false,
          acknowledgedAt: existingAlert?.acknowledgedAt || undefined,
          notes: existingAlert?.notes || ''
        };
      });
      
      res.status(200).json(alertsData);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, acknowledged, notes } = req.body;
      const alerts: AlertData[] = JSON.parse(fs.readFileSync(alertsPath, 'utf-8'));
      
      const existingIndex = alerts.findIndex(a => a.productId === productId);
      const alertData: AlertData = {
        productId,
        acknowledged,
        acknowledgedAt: acknowledged ? new Date().toISOString() : null,
        notes: notes || ''
      };
      
      if (existingIndex >= 0) {
        alerts[existingIndex] = alertData;
      } else {
        alerts.push(alertData);
      }
      
      fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));
      res.status(200).json(alertData);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
