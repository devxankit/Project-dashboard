import { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const EMPTY = { name: '', email: '', role: 'Developer' };

export default function TeamDrawer({ isOpen, onClose }) {
  const { team, loading, addMember, updateMember, deleteMember } = useApp();
  const { user } = useAuth();
  const isMaster = user?.role === 'MASTER_ADMIN';

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({ name: member.name, email: member.email, role: member.role });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMember(editing._id, form);
        toast.success('Member updated');
      } else {
        await addMember(form);
        toast.success('Member added');
      }
      handleCancel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await deleteMember(member._id);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Team Members</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {team.length} members
              {isMaster && ' · MASTER_ADMIN'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMaster && (
              <button
                onClick={openAdd}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                + Add
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Add/Edit Form (MASTER_ADMIN only) */}
        {showForm && isMaster && (
          <form
            onSubmit={handleSubmit}
            className="px-5 py-4 border-b border-gray-800 space-y-3 bg-gray-800/30 shrink-0"
          >
            <p className="text-xs font-semibold text-gray-300">
              {editing ? 'Edit Member' : 'New Member'}
            </p>
            <input
              type="text"
              placeholder="Full name *"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
            <input
              type="email"
              placeholder="Email address *"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Role (e.g. Frontend Dev)"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-700 rounded-xl text-xs text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 rounded-xl text-xs text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading.team ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-xs">No team members yet</p>
              {isMaster && (
                <button
                  onClick={openAdd}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Add the first member →
                </button>
              )}
            </div>
          ) : (
            team.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{member.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{member.email}</p>
                  <span className="text-[11px] text-indigo-400">{member.role}</span>
                </div>
                {isMaster && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEdit(member)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
