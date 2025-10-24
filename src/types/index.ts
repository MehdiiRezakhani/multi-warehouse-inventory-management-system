export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  reorderPoint: number;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Stock {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  lastUpdated: string;
}

export interface Transfer {
  id: number;
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: number;
  date: string;
  status: string;
  notes?: string;
}

export interface Alert {
  productId: number;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  recommendedOrder: number;
  status: 'critical' | 'out_of_stock' | 'low' | 'adequate' | 'overstocked';
  severity: 'critical' | 'medium' | 'low';
  acknowledged: boolean;
  acknowledgedAt?: string;
  notes?: string;
}
