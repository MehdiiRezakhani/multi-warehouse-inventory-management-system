import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Stock } from '@/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const filePath = path.join(process.cwd(), 'data', 'stock.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  let stock: Stock[] = JSON.parse(jsonData);

  if (req.method === 'GET') {
    const stockItem = stock.find((s) => s.id === parseInt(id as string));
    if (stockItem) {
      res.status(200).json(stockItem);
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else if (req.method === 'PUT') {
    const index = stock.findIndex((s) => s.id === parseInt(id as string));
    if (index !== -1) {
      stock[index] = { ...stock[index], ...req.body, id: parseInt(id as string) };
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
      res.status(200).json(stock[index]);
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else if (req.method === 'DELETE') {
    const index = stock.findIndex((s) => s.id === parseInt(id as string));
    if (index !== -1) {
      stock.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2));
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Stock item not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
