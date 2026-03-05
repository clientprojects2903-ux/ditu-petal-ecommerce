'use client';

import { createClient } from '@/lib/supabase/client';
import React, { useEffect, useState } from 'react';
import { 
  FaBoxes, 
  FaTags, 
  FaMoneyBillWave,
  FaUserFriends,
  FaSearch,
  FaBell,
  FaCog,
  FaSpinner,
  FaShoppingBag,
  FaChartPie,
  FaUsersCog,
  FaStore,
  FaLayerGroup,
  FaUserCircle,
  FaCreditCard,
  FaRegClock
} from 'react-icons/fa';
import { 
  MdCategory, 
  MdInventory, 
  MdPeople, 
  MdAttachMoney,
  MdShoppingCart,
  MdDashboard
} from 'react-icons/md';
import { 
  TbCurrencyDollar, 
  TbShoppingCart, 
  TbCategory, 
  TbUsers 
} from 'react-icons/tb';
import { BsBoxSeam, BsPeople, BsTags } from 'react-icons/bs';

// Types
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  color: string;
  bgColor?: string;
  trend?: number;
}

interface DashboardMetrics {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders?: number;
  totalRevenue?: number;
}

// Metric Card Component with better styling
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  loading, 
  color,
  bgColor = 'bg-opacity-10',
  trend 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-xl ${color} ${bgColor}`}>
          <div className={`text-${color.split('-')[1]}-600 text-2xl`}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-gray-500 text-sm font-medium tracking-wide">{title}</h3>
        {loading ? (
          <div className="flex items-center mt-2">
            <FaSpinner className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Header Component
const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <MdDashboard className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">E-commerce Analytics</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2.5 hover:bg-gray-100 rounded-xl relative transition-colors">
              <FaBell className="text-gray-600" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
              <FaCog className="text-gray-600" size={18} />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@store.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch total products
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;

        // Fetch total categories
        const { count: categoriesCount, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        if (categoriesError) throw categoriesError;

        // Fetch total users with role = 'customer'
        const { count: customersCount, error: customersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        if (customersError) throw customersError;

        setMetrics({
          totalProducts: productsCount || 0,
          totalCategories: categoriesCount || 0,
          totalCustomers: customersCount || 0
        });

      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        async () => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
          setMetrics(prev => ({ ...prev, totalProducts: count || 0 }));
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        async () => {
          const { count } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true });
          setMetrics(prev => ({ ...prev, totalCategories: count || 0 }));
        }
      )
      .subscribe();

    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        async () => {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');
          setMetrics(prev => ({ ...prev, totalCustomers: count || 0 }));
        }
      )
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
  }, [supabase]);

  // Better icons for each metric
  const metricCards = [
    {
      title: 'Total Products',
      value: metrics.totalProducts.toLocaleString(),
      icon: <BsBoxSeam />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      trend: 12
    },
    {
      title: 'Product Categories',
      value: metrics.totalCategories.toLocaleString(),
      icon: <FaLayerGroup />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      trend: 8
    },
    {
      title: 'Total Revenue',
      value: '$124.5k',
      icon: <TbCurrencyDollar />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      trend: 18
    },
    {
      title: 'Active Customers',
      value: metrics.totalCustomers.toLocaleString(),
      icon: <TbUsers />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      trend: 24
    },
  ];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="p-8">
        {/* Welcome Section */}
        

        {/* Metrics Grid with better icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <MetricCard 
              key={index} 
              {...metric} 
              loading={loading && index !== 2}
            />
          ))}
        </div>

        {/* Quick Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <MdInventory className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs text-blue-700 font-medium">Low Stock Items</p>
                <p className="text-lg font-bold text-blue-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FaShoppingBag className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs text-green-700 font-medium">Today's Orders</p>
                <p className="text-lg font-bold text-green-900">48</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FaUserFriends className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs text-purple-700 font-medium">New Customers</p>
                <p className="text-lg font-bold text-purple-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <FaCreditCard className="text-white text-xl" />
              </div>
              <div>
                <p className="text-xs text-orange-700 font-medium">Pending Payments</p>
                <p className="text-lg font-bold text-orange-900">$3,245</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaRegClock className="mr-2 text-gray-500" />
              Database Status
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <BsBoxSeam className="text-blue-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Products</p>
                <p className="text-sm font-semibold text-gray-700">{metrics.totalProducts} total</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FaLayerGroup className="text-orange-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-sm font-semibold text-gray-700">{metrics.totalCategories} active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <TbUsers className="text-purple-500 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Customers</p>
                <p className="text-sm font-semibold text-gray-700">{metrics.totalCustomers} registered</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            Last updated: {currentTime.toLocaleTimeString()} • Real-time sync active
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;