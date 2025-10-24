import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Warehouse } from '@/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'data', 'warehouses.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  let warehouses: Warehouse[] = JSON.parse(jsonData);

  if (req.method === 'GET') {
    res.status(200).json(warehouses);
  } else if (req.method === 'POST') {
    const newWarehouse = req.body as Omit<Warehouse, 'id'>;
    const warehouseWithId: Warehouse = {
      ...newWarehouse,
      id: warehouses.length ? Math.max(...warehouses.map(w => w.id)) + 1 : 1
    };
    warehouses.push(warehouseWithId);
    fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2));
    res.status(201).json(warehouseWithId);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
