import { useState } from 'react';
import ProjectRow from './ProjectRow';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const COLS = ['S.No', 'Project Name', 'Type', 'Priority', 'Start Date', 'Deadline', 'Status', 'Assigned', 'Remarks', 'Progress', 'Live Timer', 'Actions'];

export default function ProjectTable({ onEdit }) {
  const { projects, loading } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const canEdit = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN';
  const cols = canEdit ? COLS : COLS.filter((c) => c !== 'Actions');

  const statusOptions = [...new Set(
    projects.map((p) => p.status?.name).filter(Boolean)
  )];

  const typeOptions = [...new Set(
    projects.map((p) => p.projectType?.name).filter(Boolean)
  )];

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectType?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.assignedPeople?.some((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || p.status?.name === statusFilter;
    const matchType = !typeFilter || p.projectType?.name === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filter projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs md:text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors w-full"
          />
        </div>
        {statusOptions.length > 0 && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm text-white outline-none focus:border-indigo-500 transition-colors w-full sm:w-auto"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
        {typeOptions.length > 0 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm text-white outline-none focus:border-indigo-500 transition-colors w-full sm:w-auto"
          >
            <option value="">All types</option>
            {typeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <span className="text-[10px] uppercase font-bold text-gray-500 ml-auto whitespace-nowrap">
          {filtered.length} / {projects.length} Entries
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-none border border-gray-800 bg-gray-900/40">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              {cols.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading.projects ? (
              <tr>
                <td colSpan={cols.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Loading projects...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="py-20 text-center">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm text-gray-500">
                    {search || statusFilter ? 'No projects match your filters' : 'No projects yet. Click "Add Project" to get started.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <ProjectRow key={project._id} project={project} onEdit={onEdit} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
