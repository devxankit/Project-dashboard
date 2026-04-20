import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const EMPTY = {
  name: '', startDate: '', deadline: '',
  status: '', projectType: '', assignedPeople: [], remarks: '', progress: 0,
  priority: 'normal', sequence: 0
};

export default function ProjectModal({ isOpen, onClose, project }) {
  const { statuses, projectTypes, team, createProject, updateProject, createStatus, createProjectType } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#6366f1' });
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [addingStatus, setAddingStatus] = useState(false);
  
  const [newType, setNewType] = useState({ name: '' });
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [addingType, setAddingType] = useState(false);

  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const dropdownRef = useRef(null);

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
        projectType: project.projectType?._id || '',
        assignedPeople: project.assignedPeople?.map((p) => p._id) || [],
        remarks: project.remarks || '',
        progress: project.progress ?? 0,
        priority: project.priority || 'normal',
        sequence: project.sequence ?? 0,
      });
    } else {
      setForm(EMPTY);
    }
    setShowStatusForm(false);
    setShowTypeForm(false);
    setIsTeamDropdownOpen(false);
    setMemberSearch('');
  }, [project, isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTeamDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleAddType = async () => {
    if (!newType.name.trim()) return;
    setAddingType(true);
    try {
      const created = await createProjectType(newType);
      set('projectType', created._id);
      setNewType({ name: '' });
      setShowTypeForm(false);
      toast.success(`Project type "${created.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project type');
    } finally {
      setAddingType(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.deadline || !form.status || !form.projectType) {
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

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const selectedCount = form.assignedPeople.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700/80 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
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
          
          {/* Priority & Sequence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                S.No (Sequence)
              </label>
              <input
                type="number"
                value={form.sequence}
                onChange={(e) => set('sequence', Number(e.target.value))}
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

          {/* Project Type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Project Type <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.projectType}
                onChange={(e) => set('projectType', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select type...</option>
                {projectTypes.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTypeForm(!showTypeForm)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white hover:border-indigo-500 transition-colors whitespace-nowrap"
              >
                + New
              </button>
            </div>

            {/* Inline new type form */}
            {showTypeForm && (
              <div className="mt-2 flex gap-2 items-center bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Type name"
                  value={newType.name}
                  onChange={(e) => setNewType((t) => ({ ...t, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddType())}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddType}
                  disabled={addingType}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs text-white transition-colors disabled:opacity-50"
                >
                  {addingType ? '...' : 'Add'}
                </button>
              </div>
            )}
          </div>

          {/* Assign Members - Searchable Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Assign Team Members
            </label>
            <button
              type="button"
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white flex items-center justify-between hover:border-indigo-500/50 transition-colors"
            >
              <span className={selectedCount === 0 ? "text-gray-500" : "text-white"}>
                {selectedCount === 0 ? 'Select members...' : `${selectedCount} member(s) assigned`}
              </span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isTeamDropdownOpen && (
              <div className="absolute z-[60] left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-gray-800">
                  <input
                    type="text"
                    placeholder="Search personnel..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto p-1 divide-y divide-gray-800/40">
                  {filteredTeam.length === 0 ? (
                    <p className="text-[11px] text-gray-600 text-center py-6 italic">No matches found</p>
                  ) : (
                    filteredTeam.map((m) => {
                      const isSelected = form.assignedPeople.includes(m._id);
                      return (
                        <label
                          key={m._id}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all hover:bg-gray-800/80 group ${isSelected ? 'bg-indigo-500/5' : ''}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700 group-hover:border-gray-500'}`}>
                            {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-400' : 'text-gray-200'}`}>{m.name}</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black leading-none mt-0.5">{m.role}</div>
                          </div>
                          {isSelected && <span className="text-[10px] text-indigo-500 font-black">✓</span>}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => togglePerson(m._id)}
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selection Summary (Chips) */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {team.filter(m => form.assignedPeople.includes(m._id)).map(m => (
                  <div key={m._id} className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 pl-2 pr-1 py-0.5 rounded-md">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tight">{m.name}</span>
                    <button 
                      type="button" 
                      onClick={() => togglePerson(m._id)}
                      className="w-4 h-4 flex items-center justify-center text-indigo-400 hover:text-white hover:bg-indigo-600 rounded transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
