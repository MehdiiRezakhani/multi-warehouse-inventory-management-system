import { Product, Stock, Warehouse, Transfer, Alert } from '@/types';

export const convertToCSV = (data: Record<string, any>[], headers: string[]): string => {
  if (!data || data.length === 0) return '';
  
  const headerRow = headers.join(',');
  
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${dataRows}`;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportInventoryToCSV = (products: Product[], stock: Stock[], warehouses: Warehouse[]): void => {
  const data = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const totalValue = totalQuantity * product.unitCost;
    
    const warehouseStocks = warehouses.map(warehouse => {
      const warehouseStock = productStock.find(s => s.warehouseId === warehouse.id);
      return warehouseStock ? warehouseStock.quantity : 0;
    });
    
    return {
      SKU: product.sku,
      'Product Name': product.name,
      Category: product.category,
      'Unit Cost': product.unitCost.toFixed(2),
      'Reorder Point': product.reorderPoint,
      'Total Stock': totalQuantity,
      'Total Value': totalValue.toFixed(2),
      ...warehouses.reduce((acc, warehouse, index) => {
        acc[`${warehouse.code} Stock`] = warehouseStocks[index];
        return acc;
      }, {} as Record<string, number>),
      Status: totalQuantity === 0 ? 'Out of Stock' : 
              totalQuantity < product.reorderPoint ? 'Low Stock' : 
              totalQuantity > product.reorderPoint * 3 ? 'Overstocked' : 'Adequate'
    };
  });
  
  const headers = Object.keys(data[0]);
  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `inventory-report-${timestamp}.csv`);
};

export const exportTransfersToCSV = (transfers: Transfer[], products: Product[], warehouses: Warehouse[]): void => {
  const data = transfers.map(transfer => {
    const product = products.find(p => p.id === transfer.productId);
    const fromWarehouse = warehouses.find(w => w.id === transfer.fromWarehouseId);
    const toWarehouse = warehouses.find(w => w.id === transfer.toWarehouseId);
    
    return {
      'Transfer ID': transfer.id,
      Date: new Date(transfer.date).toLocaleString(),
      'Product SKU': product?.sku || 'N/A',
      'Product Name': product?.name || 'N/A',
      'From Warehouse': fromWarehouse?.name || 'N/A',
      'From Code': fromWarehouse?.code || 'N/A',
      'To Warehouse': toWarehouse?.name || 'N/A',
      'To Code': toWarehouse?.code || 'N/A',
      Quantity: transfer.quantity,
      Status: transfer.status,
      Notes: transfer.notes || ''
    };
  });
  
  const headers = Object.keys(data[0] || {});
  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `transfers-report-${timestamp}.csv`);
};

export const exportAlertsToCSV = (alerts: Alert[]): void => {
  const data = alerts.map(alert => ({
    'Product SKU': alert.sku,
    'Product Name': alert.name,
    Category: alert.category,
    'Current Stock': alert.currentStock,
    'Reorder Point': alert.reorderPoint,
    'Recommended Order': alert.recommendedOrder,
    Status: alert.status.replace('_', ' ').toUpperCase(),
    Severity: alert.severity.toUpperCase(),
    Acknowledged: alert.acknowledged ? 'Yes' : 'No',
    'Acknowledged At': alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : '',
    Notes: alert.notes || ''
  }));
  
  const headers = Object.keys(data[0] || {});
  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `alerts-report-${timestamp}.csv`);
};
