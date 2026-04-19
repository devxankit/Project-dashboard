import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    permissions: ['read']
  });

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/auth/admins');
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch admins');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/admins', formData);
      toast.success('Admin created!');
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', role: 'ADMIN', permissions: ['read'] });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await api.delete(`/auth/admins/${id}`);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleUpdateAccess = async (id, role, permissions) => {
    try {
      await api.patch(`/auth/admins/${id}`, { role, permissions });
      toast.success('Permissions updated');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage admin access and roles</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {showAddForm ? 'Cancel' : 'Add New Admin'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-900 border border-indigo-900/30 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Create New Administrator</h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Initial Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Role (Custom)</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value.toUpperCase() })}
                placeholder="ADMIN, MANAGER, etc."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">Access Levels</label>
              <div className="flex gap-4">
                {['read', 'write'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => handleTogglePermission(p)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        formData.permissions.includes(p) 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'bg-gray-800 border-gray-700 group-hover:border-gray-600'
                      }`}
                    >
                      {formData.permissions.includes(p) && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className="text-sm text-gray-300 capitalize">{p} Access</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400">ADMIN NAME</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400">EMAIL</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400">ROLE</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400">PERMISSIONS</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Array.isArray(admins) && admins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{admin.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                    admin.role === 'MASTER_ADMIN' 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5">
                    {admin.role === 'MASTER_ADMIN' ? (
                      <span className="text-[10px] text-gray-500 italic">Full Access</span>
                    ) : (
                      ['read', 'write'].map(p => {
                        const has = admin.permissions?.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              const newP = has 
                                ? admin.permissions.filter(x => x !== p)
                                : [...(admin.permissions || []), p];
                              handleUpdateAccess(admin._id, admin.role, newP);
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                              has 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-gray-800 text-gray-600 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            {p.toUpperCase()}
                          </button>
                        );
                      })
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {admin.role !== 'MASTER_ADMIN' && (
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
