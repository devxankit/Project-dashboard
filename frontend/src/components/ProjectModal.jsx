import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const EMPTY = {
  name: '', startDate: '', deadline: '',
  status: '', assignedPeople: [], remarks: '', progress: 0,
};

export default function ProjectModal({ isOpen, onClose, project }) {
  const { statuses, team, createProject, updateProject, createStatus } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#6366f1' });
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [addingStatus, setAddingStatus] = useState(false);

  const isEdit = Boolean(project);

  useEffect(() => {
    if (!isOpen) return;
    if (project) {
      setForm({
        name: project.name || '',
        startDate: project.startDate
          ? new Date(project.startDate).toISOString().split('T')[0] : '',
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().split('T')[0] : '',
        status: project.status?._id || '',
        assignedPeople: project.assignedPeople?.map((p) => p._id) || [],
        remarks: project.remarks || '',
        progress: project.progress ?? 0,
      });
    } else {
      setForm(EMPTY);
    }
    setShowStatusForm(false);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const togglePerson = (id) =>
    set('assignedPeople',
      form.assignedPeople.includes(id)
        ? form.assignedPeople.filter((p) => p !== id)
        : [...form.assignedPeople, id]
    );

  const handleAddStatus = async () => {
    if (!newStatus.name.trim()) return;
    setAddingStatus(true);
    try {
      const created = await createStatus(newStatus);
      set('status', created._id);
      setNewStatus({ name: '', color: '#6366f1' });
      setShowStatusForm(false);
      toast.success(`Status "${created.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create status');
    } finally {
      setAddingStatus(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.deadline || !form.status) {
      toast.error('Please fill all required fields');
      return;
    }
    if (new Date(form.deadline) < new Date(form.startDate)) {
      toast.error('Deadline must be after start date');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateProject(project._id, form);
        toast.success('Project updated');
      } else {
        await createProject(form);
        toast.success('Project created');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold text-white">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Enter project name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Deadline <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Status <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select status...</option>
                {statuses.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowStatusForm(!showStatusForm)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white hover:border-indigo-500 transition-colors whitespace-nowrap"
              >
                + New
              </button>
            </div>

            {/* Inline new status form */}
            {showStatusForm && (
              <div className="mt-2 flex gap-2 items-center bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Status name"
                  value={newStatus.name}
                  onChange={(e) => setNewStatus((s) => ({ ...s, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStatus())}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  autoFocus
                />
                <input
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus((s) => ({ ...s, color: e.target.value }))}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none"
                />
                <button
                  type="button"
                  onClick={handleAddStatus}
                  disabled={addingStatus}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs text-white transition-colors disabled:opacity-50"
                >
                  {addingStatus ? '...' : 'Add'}
                </button>
              </div>
            )}
          </div>

          {/* Assign Members */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Assign Team Members
            </label>
            <div className="max-h-36 overflow-y-auto bg-gray-800 border border-gray-700 rounded-xl divide-y divide-gray-700/50">
              {team.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No team members yet. Ask a MASTER_ADMIN to add some.
                </p>
              ) : (
                team.map((m) => (
                  <label
                    key={m._id}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedPeople.includes(m._id)}
                      onChange={() => togglePerson(m._id)}
                      className="accent-indigo-500 w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-sm text-white">{m.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{m.role}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Progress — {form.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => set('progress', Number(e.target.value))}
              className="w-full accent-indigo-500 h-2"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
              placeholder="Optional notes or context..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-60 shadow-lg shadow-indigo-900/30"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
