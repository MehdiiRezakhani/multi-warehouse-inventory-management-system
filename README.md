# 🌿 GreenSupply Inventory Management System

A modern, full-featured inventory management system built for sustainable product distribution companies. Manage multi-warehouse operations with real-time insights, intelligent alerts, and seamless stock transfers.

---

## ✨ Features

### 📊 Interactive Dashboard
- **Real-time Metrics**: Track total inventory value, stock levels, and warehouse operations at a glance
- **Data Visualizations**: Interactive pie and bar charts for category and warehouse distribution
- **Smart Filtering**: Search, filter by category/status, and sort inventory with real-time updates
- **Responsive Design**: Seamlessly adapts from mobile to desktop
- **Dark Mode**: Eye-friendly dark theme with smooth transitions

### 🔄 Stock Transfer System
- **Intuitive Transfers**: Move inventory between warehouses with a clean, validated form
- **Real-time Validation**: Automatic stock availability checks and error prevention
- **Transfer History**: Complete audit trail with filtering and search capabilities
- **Smart Notifications**: Instant feedback on successful transfers or validation errors

### 🚨 Intelligent Alert System
- **Automatic Detection**: Identifies critical, low, adequate, and overstocked items
- **Smart Recommendations**: Calculates optimal reorder quantities based on stock levels
- **Acknowledgement Tracking**: Mark alerts as handled with notes for audit trails
- **Categorized Views**: Tabbed interface for different alert priorities

### 🎨 Modern UI/UX
- **Minimal Design**: Clean, professional interface with eco-friendly aesthetics
- **Smooth Animations**: Polished transitions and hover effects
- **Accessibility**: WCAG AA compliant with keyboard navigation support
- **Consistent Theming**: Cohesive design language across all pages

### 📥 Data Export
- **CSV Export**: Download inventory reports, transfer history, and alerts
- **Filtered Exports**: Export only what you see with active filters applied
- **Excel Compatible**: Properly formatted CSV files ready for spreadsheet applications

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/MehdiiRezakhani/multi-warehouse-inventory-management-system

# Navigate to project directory
cd greensupply-inventory

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🛠️ Tech Stack

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with server-side rendering
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Material-UI 6](https://mui.com/)** - React component library
- **[Recharts](https://recharts.org/)** - Composable charting library

### Key Features
- **React Hooks** - Modern state management
- **Context API** - Global theme management
- **Client-side Filtering** - Instant search and filter results
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - System-wide theme switching

---

## 🎯 Key Features Explained

### Dashboard
The dashboard provides a comprehensive overview of your inventory operations:
- **Metric Cards**: Quick stats on inventory value, total items, warehouses, and active alerts
- **Category Distribution**: Pie chart showing stock breakdown by product category
- **Warehouse Analysis**: Bar chart comparing item counts and values across locations
- **Inventory Table**: Sortable, filterable list of all products with status indicators

### Stock Transfers
Efficiently move inventory between warehouses:
- **Validation**: Prevents invalid transfers (insufficient stock, same-warehouse moves)
- **Atomic Updates**: Ensures both source and destination update together
- **History Tracking**: Complete record of all transfers with search and filters
- **Date Filtering**: View transfers by today, last week, or last month

### Alert System
Proactive inventory management with intelligent alerts:
- **Automatic Calculation**: Analyzes stock levels against reorder points
- **Severity Levels**: Critical (< 50% reorder point), Low (< reorder point), Overstocked (> 3× reorder point)
- **Reorder Recommendations**: Suggests optimal order quantities
- **Acknowledgement System**: Track which alerts have been addressed

---

## 🎨 Design Philosophy

### Minimal & Modern
- Clean layouts with ample whitespace
- Subtle shadows and smooth transitions
- Professional color palette with eco-friendly green accents
- Consistent 8px spacing grid

### Responsive First
- Mobile-optimized layouts
- Adaptive charts and tables
- Touch-friendly controls
- Breakpoints: Mobile (< 600px), Tablet (600-960px), Desktop (> 960px)

### Accessibility
- WCAG AA color contrast ratios
- Keyboard navigation support
- Screen reader friendly
- Focus indicators on all interactive elements

---

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for custom configuration:

```env
# API Configuration (if using external APIs)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_EXPORTS=true
```

### Data Storage
The system uses JSON files for data persistence. In production, replace with a database:
- `data/products.json` - Product catalog
- `data/warehouses.json` - Warehouse locations
- `data/stock.json` - Current stock levels
- `data/transfers.json` - Transfer history
- `data/alerts.json` - Alert acknowledgements

---

## 📊 Usage Examples

### Creating a Transfer
1. Navigate to the Transfers page
2. Select a product from the dropdown
3. Choose source and destination warehouses
4. Enter quantity (system shows available stock)
5. Add optional notes
6. Click "Execute Transfer"

### Managing Alerts
1. Go to the Alerts page
2. View alerts by category (Critical, Low Stock, Overstocked, Acknowledged)
3. Use filters to find specific products
4. Click "Acknowledge" on an alert
5. Add notes about actions taken
6. Alert moves to Acknowledged tab

### Exporting Data
1. Navigate to any page (Dashboard, Transfers, or Alerts)
2. Apply desired filters
3. Click the "Export" or "Export CSV" button
4. File downloads automatically with timestamp

---

## 🧪 Testing

### Manual Testing
```bash
# Run the development server
npm run dev

# Test in multiple browsers
- Chrome (recommended)
- Firefox
- Safari
- Edge
```

### Test Scenarios
- ✅ Create transfers with valid and invalid data
- ✅ Filter inventory by category and status
- ✅ Toggle dark mode on all pages
- ✅ Export data to CSV
- ✅ Acknowledge alerts with notes
- ✅ Test responsive design at different screen sizes

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Recharts team for the responsive charting solution
- Next.js team for the amazing React framework
- The open-source community for inspiration and tools

---

## 🐛 Known Issues

- CSV export may not work in older browsers (IE11)
- Dark mode preference requires localStorage support
- Large datasets (1000+ products) may impact filter performance

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Tab` - Navigate between form fields
- `Escape` - Clear search fields (when focused)
- `Enter` - Submit forms

### Performance Tips
- Use filters to reduce visible data
- Export filtered data for faster processing
- Clear browser cache if experiencing issues

### Best Practices
- Acknowledge alerts promptly to maintain audit trail
- Add notes when acknowledging alerts for future reference
- Use date filters on transfers page for faster loading
- Export data regularly for backup purposes

---

## ⭐ Show Your Support

If you find this project useful, please consider:
- Giving it a ⭐ on GitHub
- Sharing it with others
- Contributing to the codebase
- Reporting bugs or suggesting features

---

<div align="center">

**Built with ❤️ for sustainable businesses**

[Report Bug](https://github.com/MehdiiRezakhani/multi-warehouse-inventory-management-system/issues) · [Request Feature](https://github.com/MehdiiRezakhani/multi-warehouse-inventory-management-system/issues)

</div>
