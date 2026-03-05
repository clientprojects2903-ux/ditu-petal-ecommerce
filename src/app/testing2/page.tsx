'use client';

import React, { useState } from 'react';
import { 
  FaBox, 
  FaTags, 
  FaUsers, 
  FaShoppingCart, 
  FaChartLine, 
  FaDollarSign,
  FaEye,
  FaStar,
  FaBell,
  FaSearch,
  FaCog,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaPercentage,
  FaCreditCard,
  FaWallet,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';

// Types
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  subtitle?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  image?: string;
  stock: number;
  category: string;
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

interface Category {
  id: number;
  name: string;
  products: number;
  revenue: number;
  growth: number;
}

interface UserActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'order' | 'review' | 'login' | 'purchase';
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <div className={`text-${color.split('-')[1]}-600 text-xl`}>{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'} bg-${trend.isPositive ? 'green' : 'red'}-50 px-2 py-1 rounded-full`}>
            {trend.isPositive ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// Sales Chart Component
const SalesChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  const data: Record<string, ChartDataPoint[]> = {
    week: [
      { label: 'Mon', value: 65 },
      { label: 'Tue', value: 78 },
      { label: 'Wed', value: 82 },
      { label: 'Thu', value: 91 },
      { label: 'Fri', value: 88 },
      { label: 'Sat', value: 103 },
      { label: 'Sun', value: 95 },
    ],
    month: [
      { label: 'Week 1', value: 420 },
      { label: 'Week 2', value: 580 },
      { label: 'Week 3', value: 490 },
      { label: 'Week 4', value: 670 },
    ]
  };

  const currentData = data[timeRange as keyof typeof data] || data.week;
  const maxValue = Math.max(...currentData.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Compare sales performance over time</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 4 weeks</option>
            <option value="quarter">Last 3 months</option>
          </select>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <FaDownload className="text-gray-500" size={16} />
          </button>
        </div>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart bars */}
        <div className="ml-10 flex items-end justify-between h-48">
          {currentData.map((item, index) => (
            <div key={index} className="flex flex-col items-center w-1/7 group">
              <div className="relative w-full flex justify-center">
                <div 
                  className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:from-indigo-600 group-hover:to-indigo-500 cursor-pointer"
                  style={{ height: `${(item.value / maxValue) * 140}px` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.value} sales
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-500">Total Sales</p>
          <p className="text-lg font-semibold text-gray-800">602</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-lg font-semibold text-gray-800">86</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Growth</p>
          <p className="text-lg font-semibold text-green-600">+12.5%</p>
        </div>
      </div>
    </div>
  );
};

// Top Products Table Component
const TopProductsTable: React.FC = () => {
  const products: TopProduct[] = [
    { id: 1, name: 'Wireless Headphones', sales: 234, revenue: 11699, rating: 4.8, stock: 45, category: 'Electronics' },
    { id: 2, name: 'Smart Watch Series 5', sales: 187, revenue: 37399, rating: 4.7, stock: 12, category: 'Electronics' },
    { id: 3, name: 'Laptop Backpack', sales: 156, revenue: 7799, rating: 4.9, stock: 78, category: 'Accessories' },
    { id: 4, name: 'Bluetooth Speaker', sales: 143, revenue: 7149, rating: 4.6, stock: 34, category: 'Electronics' },
    { id: 5, name: 'USB-C Hub Adapter', sales: 121, revenue: 3629, rating: 4.5, stock: 92, category: 'Accessories' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Top Products</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Sales</th>
              <th className="pb-3 font-medium">Revenue</th>
              <th className="pb-3 font-medium">Stock</th>
              <th className="pb-3 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-sm font-medium text-gray-800">{product.name}</td>
                <td className="py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-600">{product.sales}</td>
                <td className="py-3 text-sm text-gray-600">${product.revenue.toLocaleString()}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 50 ? 'bg-green-100 text-green-600' : 
                    product.stock > 20 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" size={12} />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Orders Table Component
const RecentOrders: React.FC = () => {
  const orders: Order[] = [
    { id: '#ORD-001', customer: 'John Smith', amount: 299.99, status: 'delivered', date: '2024-01-15', items: 3 },
    { id: '#ORD-002', customer: 'Emma Wilson', amount: 149.50, status: 'processing', date: '2024-01-15', items: 2 },
    { id: '#ORD-003', customer: 'Michael Brown', amount: 599.99, status: 'shipped', date: '2024-01-14', items: 5 },
    { id: '#ORD-004', customer: 'Sarah Davis', amount: 89.99, status: 'pending', date: '2024-01-14', items: 1 },
    { id: '#ORD-005', customer: 'James Johnson', amount: 429.99, status: 'cancelled', date: '2024-01-13', items: 4 },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      processing: 'bg-blue-100 text-blue-600',
      shipped: 'bg-purple-100 text-purple-600',
      delivered: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Items</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-sm font-medium text-indigo-600">{order.id}</td>
                <td className="py-3 text-sm text-gray-800">{order.customer}</td>
                <td className="py-3 text-sm text-gray-600">{order.items}</td>
                <td className="py-3 text-sm font-medium text-gray-800">${order.amount}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Category Performance Component
const CategoryPerformance: React.FC = () => {
  const categories: Category[] = [
    { id: 1, name: 'Electronics', products: 456, revenue: 45678, growth: 15 },
    { id: 2, name: 'Clothing', products: 892, revenue: 28934, growth: 8 },
    { id: 3, name: 'Books', products: 234, revenue: 12345, growth: -2 },
    { id: 4, name: 'Home & Garden', products: 567, revenue: 34567, growth: 22 },
    { id: 5, name: 'Sports', products: 345, revenue: 19876, growth: 5 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Performance</h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-xs text-gray-500">{category.products} products</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full" 
                  style={{ width: `${(category.revenue / 50000) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">${category.revenue.toLocaleString()}</span>
                <span className={`text-xs flex items-center ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {category.growth > 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                  {Math.abs(category.growth)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  
  // Mock data for metrics
  const metrics = [
    {
      title: 'Total Products',
      value: '2,847',
      icon: <FaBox size={20} />,
      trend: { value: 12, isPositive: true },
      color: 'bg-blue-500',
      subtitle: '+124 this month'
    },
    {
      title: 'Total Categories',
      value: '24',
      icon: <FaTags size={20} />,
      trend: { value: 8, isPositive: true },
      color: 'bg-green-500',
      subtitle: '2 new categories'
    },
    {
      title: 'Total Users',
      value: '18.2k',
      icon: <FaUsers size={20} />,
      trend: { value: 24, isPositive: true },
      color: 'bg-purple-500',
      subtitle: '+3,421 this month'
    },
    {
      title: 'Total Orders',
      value: '5,432',
      icon: <FaShoppingCart size={20} />,
      trend: { value: 5, isPositive: false },
      color: 'bg-orange-500',
      subtitle: '1,234 pending'
    },
    {
      title: 'Revenue',
      value: '$124.5k',
      icon: <FaDollarSign size={20} />,
      trend: { value: 18, isPositive: true },
      color: 'bg-pink-500',
      subtitle: 'Avg. $67.50 per order'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      icon: <FaPercentage size={20} />,
      trend: { value: 0.5, isPositive: true },
      color: 'bg-indigo-500',
      subtitle: '2.1k visitors today'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                E‑commerce Admin
              </h1>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Live Dashboard
              </span>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <FaBell className="text-gray-600" size={20} />
                {notifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FaCog className="text-gray-600" size={20} />
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800">Admin User</p>
                  <p className="text-gray-500 text-xs">admin@store.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <CategoryPerformance />
          </div>
        </div>

        {/* Orders and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentOrders />
          <TopProductsTable />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCreditCard className="text-blue-500 mr-3" size={20} />
                  <span className="text-sm text-gray-700">Credit Card</span>
                </div>
                <span className="text-sm font-medium text-gray-800">$78.4k</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaWallet className="text-green-500 mr-3" size={20} />
                  <span className="text-sm text-gray-700">Digital Wallet</span>
                </div>
                <span className="text-sm font-medium text-gray-800">$32.1k</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTruck className="text-purple-500 mr-3" size={20} />
                  <span className="text-sm text-gray-700">Cash on Delivery</span>
                </div>
                <span className="text-sm font-medium text-gray-800">$14.0k</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center">
                <FaBox className="mx-auto text-blue-500 mb-2" size={20} />
                <span className="text-xs font-medium text-gray-700">Add Product</span>
              </button>
              <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center">
                <FaTags className="mx-auto text-green-500 mb-2" size={20} />
                <span className="text-xs font-medium text-gray-700">Category</span>
              </button>
              <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center">
                <FaUsers className="mx-auto text-purple-500 mb-2" size={20} />
                <span className="text-xs font-medium text-gray-700">Add User</span>
              </button>
              <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center">
                <FaShoppingCart className="mx-auto text-orange-500 mb-2" size={20} />
                <span className="text-xs font-medium text-gray-700">New Order</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" size={14} />
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" size={14} />
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-2" size={14} />
                  <span className="text-sm text-gray-600">Cache Server</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">Degraded</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;