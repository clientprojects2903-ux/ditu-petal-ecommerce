// app/admin/users/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import React, { useState, useEffect } from 'react';
// Adjust the import path as needed

// Types
interface User {
  id: string;
  name: string | null;
  email: string;
  mobile_number: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
}

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface UserWithAddresses extends User {
  addresses: Address[];
}

export default function UserManagementPage() {
  const supabase = createClient();
  
  // State management
  const [users, setUsers] = useState<UserWithAddresses[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithAddresses | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Form states
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    mobile_number: '',
    role: 'customer'
  });
  
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    is_default: false
  });
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users with their addresses
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch addresses for all users
      const { data: addressesData, error: addressesError } = await supabase
        .from('address')
        .select('*');

      if (addressesError) throw addressesError;

      // Combine users with their addresses
      const usersWithAddresses: UserWithAddresses[] = usersData.map((user: User) => ({
        ...user,
        addresses: addressesData.filter((addr: Address) => addr.user_id === user.id) || []
      }));

      setUsers(usersWithAddresses);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle user form input changes
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle address form input changes
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Validate user form
  const validateUserForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (formData.mobile_number && !/^\d{10}$/.test(formData.mobile_number)) {
      errors.mobile_number = 'Mobile number must be 10 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate address form
  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!addressForm.full_name) errors.full_name = 'Full name is required';
    if (!addressForm.phone) errors.phone = 'Phone is required';
    if (!addressForm.address_line1) errors.address_line1 = 'Address line 1 is required';
    if (!addressForm.city) errors.city = 'City is required';
    if (!addressForm.state) errors.state = 'State is required';
    if (!addressForm.pincode) errors.pincode = 'Pincode is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add or update user
  const handleSaveUser = async () => {
    if (!validateUserForm()) return;

    try {
      if (modalMode === 'add') {
        // Note: In a production app, you'd need to create the auth user first
        // This would typically be done through Supabase Auth signUp method
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email!,
          password: 'temporary-password', // You'd want to generate/send this
          options: {
            data: {
              name: formData.name,
              role: formData.role
            }
          }
        });

        if (authError) throw authError;
        
        if (authData.user) {
          // Create the user record in the users table
          const { data, error } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              name: formData.name,
              email: formData.email,
              mobile_number: formData.mobile_number,
              role: formData.role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) throw error;
          
          setUsers(prev => [{ ...data, addresses: [] }, ...prev]);
        }
      } else if (modalMode === 'edit' && selectedUser) {
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            mobile_number: formData.mobile_number,
            role: formData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedUser.id);

        if (error) throw error;

        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData, updated_at: new Date().toISOString() }
            : user
        ));
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      resetForms();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user: ' + (error as Error).message);
    }
  };

  // Add or update address
  const handleSaveAddress = async () => {
    if (!selectedUser || !validateAddressForm()) return;

    try {
      if (addressForm.is_default) {
        // Set all other addresses of this user to not default
        await supabase
          .from('address')
          .update({ is_default: false })
          .eq('user_id', selectedUser.id);
      }

      if (editingAddressId) {
        // Update existing address
        const { error } = await supabase
          .from('address')
          .update({
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2,
            city: addressForm.city,
            state: addressForm.state,
            country: addressForm.country,
            pincode: addressForm.pincode,
            is_default: addressForm.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddressId);

        if (error) throw error;
      } else {
        // Add new address
        const { error } = await supabase
          .from('address')
          .insert([{
            user_id: selectedUser.id,
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2,
            city: addressForm.city,
            state: addressForm.state,
            country: addressForm.country,
            pincode: addressForm.pincode,
            is_default: addressForm.is_default,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      // Refresh user data
      await fetchUsers();
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their addresses.')) return;

    try {
      // Note: Due to CASCADE delete, addresses will be automatically deleted
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('address')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (addressId: string, userId: string) => {
    try {
      // First, set all addresses of this user to not default
      await supabase
        .from('address')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected address as default
      const { error } = await supabase
        .from('address')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await fetchUsers();
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  // Open modal for viewing/editing user
  const openUserModal = (user: UserWithAddresses | null, mode: 'view' | 'edit' | 'add') => {
    setModalMode(mode);
    setSelectedUser(user);
    
    if (user && mode !== 'add') {
      setFormData({
        name: user.name || '',
        email: user.email,
        mobile_number: user.mobile_number || '',
        role: user.role
      });
    } else {
      resetForms();
    }
    
    setIsModalOpen(true);
  };

  // Edit address
  const editAddress = (address: Address) => {
    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      is_default: address.is_default
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  // Reset forms
  const resetForms = () => {
    setFormData({
      name: '',
      email: '',
      mobile_number: '',
      role: 'customer'
    });
    resetAddressForm();
    setFormErrors({});
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      is_default: false
    });
    setEditingAddressId(null);
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile_number?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => openUserModal(null, 'add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Addresses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-lg">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.mobile_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.addresses.length} address(es)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openUserModal(user, 'view')}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openUserModal(user, 'edit')}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {modalMode === 'add' ? 'Add New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    resetForms();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Form */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleUserInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleUserInputChange}
                    disabled={modalMode === 'view' || modalMode === 'edit'} // Email shouldn't be editable
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number || ''}
                    onChange={handleUserInputChange}
                    disabled={modalMode === 'view'}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.mobile_number ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.mobile_number && <p className="mt-1 text-xs text-red-500">{formErrors.mobile_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role || 'customer'}
                    onChange={handleUserInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>

              {/* Addresses Section (only for view/edit mode) */}
              {selectedUser && modalMode !== 'add' && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Addresses</h3>
                    <button
                      onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Add Address
                    </button>
                  </div>

                  {/* Address Form */}
                  {showAddressForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-3">
                        {editingAddressId ? 'Edit Address' : 'New Address'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="full_name"
                            value={addressForm.full_name || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.full_name ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                          <input
                            type="text"
                            name="phone"
                            value={addressForm.phone || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.phone ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                          <input
                            type="text"
                            name="address_line1"
                            value={addressForm.address_line1 || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.address_line1 ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                          <input
                            type="text"
                            name="address_line2"
                            value={addressForm.address_line2 || ''}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.city ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={addressForm.state || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.state ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={addressForm.country || 'India'}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={addressForm.pincode || ''}
                            onChange={handleAddressInputChange}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              formErrors.pincode ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_default"
                              checked={addressForm.is_default || false}
                              onChange={handleAddressInputChange}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                            resetAddressForm();
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Addresses List */}
                  <div className="space-y-3">
                    {selectedUser.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{address.full_name}</h4>
                              {address.is_default && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-600">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id, selectedUser.id)}
                                className="text-green-600 hover:text-green-900 text-sm"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => editAddress(address)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedUser.addresses.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No addresses found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              {modalMode !== 'view' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedUser(null);
                      resetForms();
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === 'add' ? 'Add User' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}