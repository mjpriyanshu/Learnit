import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  // Context hooks first
  const { user } = useContext(AuthContext);
  
  // Navigation hooks
  const navigate = useNavigate();
  
  // State variables
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  
  // Event handlers
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate]);
  
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/admin/users', newUser);
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'student' });
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };
  
  const handleSuspendUser = async (userId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/suspend`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };
  
  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
        <div className='w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin'></div>
        <div className='text-2xl text-gray-300'>Loading...</div>
      </div>
    );
  }
  
  return (
    <div className='min-h-screen py-8' style={{ background: 'linear-gradient(135deg, #0a0a1e 0%, #1a0a2e 25%, #16213e 50%, #0f3460 75%, #0a192f 100%)' }}>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-4xl font-bold' style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
              WebkitBackdropClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>User Management</h1>
            <p className='text-gray-400 mt-2'>Manage all platform users</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='px-6 py-3 text-white rounded-lg font-semibold transition'
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)'}
          >
            + Create User
          </button>
        </div>
        
        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='rounded-xl overflow-hidden'
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(99, 102, 241, 0.2)'
          }}
        >
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                <tr>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300'>Name</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300'>Email</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300'>Role</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300'>Status</th>
                  <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300'>Actions</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid rgba(99, 102, 241, 0.2)' }}>
                {users.map((u) => (
                  <tr key={u._id} className='transition hover:bg-white/5' style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <td className='px-6 py-4 text-gray-200'>{u.name}</td>
                    <td className='px-6 py-4 text-gray-400'>{u.email}</td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.isSuperAdmin 
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {u.isSuperAdmin ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.isActive 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        {!u.isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleSuspendUser(u._id, u.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium transition ${
                                u.isActive 
                                  ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' 
                                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              }`}
                              disabled={u.role === 'admin' && !user.isSuperAdmin}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className='px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium hover:bg-red-500/30 transition'
                              disabled={u.role === 'admin' && !user.isSuperAdmin}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {u.isSuperAdmin && (
                          <span className='text-xs text-gray-400 italic'>Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      
      {/* Create User Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 p-4' style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='rounded-xl p-8 w-full max-w-md'
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 className='text-2xl font-bold text-gray-200 mb-6'>Create New User</h2>
            
            <form onSubmit={handleCreateUser} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Name</label>
                <input
                  type='text'
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className='w-full px-4 py-2 rounded-lg outline-none'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#e0e7ff'
                  }}
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Email</label>
                <input
                  type='email'
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className='w-full px-4 py-2 rounded-lg outline-none'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#e0e7ff'
                  }}
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Password</label>
                <input
                  type='password'
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  className='w-full px-4 py-2 rounded-lg outline-none'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#e0e7ff'
                  }}
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className='w-full px-4 py-2 rounded-lg outline-none'
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#e0e7ff'
                  }}
                  disabled={!user.isSuperAdmin}
                >
                  <option value='student'>Student</option>
                  <option value='admin'>Admin</option>
                </select>
                {!user.isSuperAdmin && (
                  <p className='text-xs text-gray-400 mt-1'>Only super admin can create admin accounts</p>
                )}
              </div>
              
              <div className='flex gap-3 mt-6'>
                <button
                  type='submit'
                  className='flex-1 py-2 text-white rounded-lg font-semibold transition'
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Create User
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ name: '', email: '', password: '', role: 'student' });
                  }}
                  className='flex-1 py-2 text-gray-300 rounded-lg font-semibold transition'
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;







