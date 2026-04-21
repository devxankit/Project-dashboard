import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import useLiveTimer from '../hooks/useLiveTimer';
import { formatDate } from '../utils/helpers';

function ProjectViewModal({ project, onClose }) {
  if (!project) return null;
  const elapsed = useLiveTimer(project.startDate, project.completedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-6 md:p-8 border-b border-gray-800 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 md:top-6 right-4 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gray-800/50 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[9px] md:text-[10px] px-2.5 py-1 rounded-none font-black uppercase tracking-widest border ${
              project.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              project.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              project.priority === 'low' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-gray-500/10 text-gray-400 border-gray-500/20'
            }`}>
              {project.priority || 'normal'}
            </span>
            <span className="text-[9px] md:text-[10px] px-2.5 py-1 rounded-none font-black uppercase tracking-widest border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {project.projectType?.name || 'Standard'}
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-white leading-tight uppercase truncate pr-10">{project.name}</h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Timeline</label>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <div className={`px-3 py-2 rounded-none text-xs font-semibold border ${
                    new Date() > new Date(project.deadline)
                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                    : 'bg-gray-800 text-gray-300 border-transparent'
                  }`}>
                    {formatDate(project.startDate)}
                  </div>
                  <span className="text-gray-700">➔</span>
                  <div className={`px-3 py-2 rounded-none text-xs font-semibold border ${
                    new Date() > new Date(project.deadline)
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-gray-800 text-gray-300 border-transparent'
                  }`}>
                    {formatDate(project.deadline)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Status</label>
                  <StatusBadge status={project.status} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Monitor</label>
                  <div className={`inline-block text-[11px] font-mono font-black px-3 py-1.5 border ${
                    new Date() > new Date(project.deadline)
                    ? 'bg-red-950/40 text-red-500 border-red-500/30'
                    : 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {elapsed}
                  </div>
                </div>
              </div>
              
              {project.completedAt && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 text-indigo-400">Completion Date</label>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 px-3 py-2 text-xs font-bold text-white uppercase tracking-wider">
                    Finished on {formatDate(project.completedAt)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Completion</label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">{project.progress}%</span>
                </div>
                <ProgressBar progress={project.progress} editable={false} />
              </div>
            </div>
          </div>

          {/* Assigned People */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Assigned Team</label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {project.assignedPeople?.length > 0 ? (
                project.assignedPeople.map((person, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-gray-800/50 border border-gray-700/50 pl-2 pr-3 md:pr-4 py-1.5 rounded-none group hover:border-gray-500 transition-all">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-none bg-indigo-600 flex items-center justify-center text-[9px] md:text-[10px] font-black text-white shadow-lg uppercase">
                      {person.name?.[0]}
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs font-bold text-white leading-none mb-0.5 uppercase">{person.name}</div>
                      <div className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest">{person.role || 'Member'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-600">No personnel assigned.</span>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Remarks</label>
            <div className="bg-gray-800/30 border border-gray-800 p-4 md:p-6 rounded-none text-gray-400 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
              {project.remarks || 'No remarks available.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-1000 p-4 md:p-6 border-t border-gray-800 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none border border-gray-700"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicRow({ project, onView }) {
  const elapsed = useLiveTimer(project.startDate, project.completedAt);
  
  return (
    <tr className="border-b border-gray-800/80 hover:bg-gray-800/10 transition-colors group">
      <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{project.sequence || 0}</td>
      <td className="px-4 py-2.5">
        <div className="font-bold text-white text-[14px] leading-tight group-hover:text-indigo-400 transition-colors uppercase">{project.name}</div>
      </td>
      <td className="px-4 py-2.5">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 py-1 bg-indigo-500/5 border border-indigo-500/10">
          {project.projectType?.name || 'Standard'}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span className={`text-[9px] px-2 py-0.5 rounded-none font-black uppercase tracking-widest border ${
          project.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          project.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
          project.priority === 'low' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
          'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }`}>
          {project.priority || 'normal'}
        </span>
      </td>
      <td className="px-4 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">{formatDate(project.startDate)}</td>
      <td className="px-4 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">{formatDate(project.deadline)}</td>
      <td className="px-4 py-2.5 min-w-[120px]">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          {project.assignedPeople?.map((person, idx) => (
            <div key={idx} className="text-[9px] font-black text-gray-500 uppercase tracking-tight leading-none truncate underline decoration-gray-800 underline-offset-2">
              {person.name}
            </div>
          ))}
          {(!project.assignedPeople || project.assignedPeople.length === 0) && (
            <span className="text-[9px] text-gray-700 italic lowercase">unassigned</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 w-40">
        <ProgressBar progress={project.progress} editable={false} />
      </td>
      <td className="px-4 py-2.5">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span className={`text-[12px] font-mono font-bold px-3 py-1.5 rounded-none shadow-inner border transition-colors ${
          new Date() > new Date(project.deadline)
            ? 'bg-red-950/30 text-red-500 border-red-500/20 shadow-red-500/10'
            : 'bg-indigo-950/20 text-indigo-400 border-indigo-900/10'
        }`}>
          {elapsed}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right">
        <button 
          onClick={() => onView(project)}
          className="w-8 h-8 rounded-none bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white transition-all flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg group-hover:shadow-indigo-500/10 border border-gray-700"
          title="View Details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProject, setViewProject] = useState(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  useEffect(() => {
    api.get('/projects/public')
      .then(res => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Derived Options
  const uniqueStatuses = useMemo(() => [
    ...new Set(projects.map(p => p.status?.name).filter(Boolean))
  ].sort(), [projects]);

  const uniqueTypes = useMemo(() => [
    ...new Set(projects.map(p => p.projectType?.name).filter(Boolean))
  ].sort(), [projects]);

  const uniquePeople = useMemo(() => [
    ...new Set(projects.flatMap(p => p.assignedPeople?.map(ap => ap.name)).filter(Boolean))
  ].sort(), [projects]);

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.remarks?.toLowerCase().includes(search.toLowerCase()) ||
        p.assignedPeople?.some(ap => ap.name?.toLowerCase().includes(search.toLowerCase()));
      
      const matchStatus = !statusFilter || p.status?.name === statusFilter;
      const matchType = !typeFilter || p.projectType?.name === typeFilter;
      const matchPriority = !priorityFilter || p.priority === priorityFilter;
      const matchAssigned = !assignedFilter || p.assignedPeople?.some(ap => ap.name === assignedFilter);

      return matchSearch && matchStatus && matchType && matchPriority && matchAssigned;
    });
  }, [projects, search, statusFilter, typeFilter, priorityFilter, assignedFilter]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPriorityFilter('');
    setAssignedFilter('');
  };

  const isFiltered = search || statusFilter || typeFilter || priorityFilter || assignedFilter;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col scroll-smooth">
      {/* Header/Branding */}
      <header className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-6 text-center animate-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-[-0.05em] uppercase mb-4">Project Live Dashboard</h1>
        <div className="w-24 md:w-32 h-1 bg-indigo-600 mx-auto rounded-none shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
      </header>

      {/* Filter Bar */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mb-6 animate-in fade-in duration-500 delay-150">
        <div className="bg-gray-900/50 border border-gray-800 p-3 md:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4 shadow-xl">
          {/* Search */}
          <div className="flex-1 min-w-0 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-none pl-9 pr-4 py-2.5 text-[10px] md:text-xs font-bold text-white placeholder-gray-600 uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex items-center gap-3">
            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-auto bg-gray-800 border border-gray-700 rounded-none px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors cursor-pointer"
            >
              <option value="">Status: All</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>

            {/* Type Filter */}
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full lg:w-auto bg-gray-800 border border-gray-700 rounded-none px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors cursor-pointer"
            >
              <option value="">Type: All</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>

            {/* Priority Filter */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full lg:w-auto bg-gray-800 border border-gray-700 rounded-none px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors cursor-pointer"
            >
              <option value="">Priority: All</option>
              <option value="low">LOW</option>
              <option value="normal">NORMAL</option>
              <option value="high">HIGH</option>
              <option value="urgent">URGENT</option>
            </select>

            {/* Assigned Filter */}
            <select 
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full lg:w-auto bg-gray-800 border border-gray-700 rounded-none px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors cursor-pointer sm:col-span-1"
            >
              <option value="">Team: Everyone</option>
              {uniquePeople.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-3 lg:ml-auto pt-2 lg:pt-0">
            <div className={`px-3 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
              isFiltered 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)] animate-in fade-in slide-in-from-right-4' 
                : 'bg-gray-800/30 text-gray-500 border-gray-800/50'
            }`}>
              {isFiltered ? (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                  {statusFilter || typeFilter || priorityFilter || assignedFilter || 'SEARCH'} - {filteredProjects.length} PROJECTS FOUND
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  TOTAL - {projects.length} PROJECTS
                </span>
              )}
            </div>

            {isFiltered && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-red-500/80 hover:text-red-400 uppercase tracking-widest transition-colors whitespace-nowrap hover:scale-105 active:scale-95"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Centered Table */}
      <main className="flex-1 flex items-start justify-center p-2 md:p-8">
        <div className="w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-none overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-700">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-800">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-800/80 border-b border-gray-700">
                  {['#', 'Project', 'Type', 'Priority', 'Start', 'Deadline', 'Assigned', 'Progress', 'Status', 'Timer', ''].map((col, idx) => (
                    <th key={idx} className="px-4 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-40 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_25px_rgba(79,70,229,0.3)]" />
                        <span className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing System...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl grayscale opacity-30">🔍</span>
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px] md:text-[11px]">No matches found.</p>
                        <button onClick={clearFilters} className="text-indigo-500 font-black text-[9px] uppercase tracking-widest mt-2 underline decoration-indigo-900">Reset Search</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(project => (
                    <PublicRow 
                      key={project._id} 
                      project={project} 
                      onView={setViewProject} 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {viewProject && (
        <ProjectViewModal 
          project={viewProject} 
          onClose={() => setViewProject(null)} 
        />
      )}

      {/* Footer with Admin Link */}
      <footer className="py-12 px-6 text-center border-t border-gray-900 mt-auto bg-black/20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-6 text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
            <span>&copy; 2026 ProjDash Enterprise System</span>
            <span className="w-1.5 h-1.5 bg-gray-900 rounded-none rotate-45" />
            <Link to="/login" className="text-gray-600 hover:text-indigo-400 transition-all flex items-center gap-2 group">
              Unauthorized Access Prohibited <span className="group-hover:translate-x-1.5 transition-transform text-indigo-500">→</span>
            </Link>
          </div>
          <p className="text-[9px] text-gray-800 font-medium max-w-sm uppercase tracking-widest leading-relaxed">
            This display is for synchronized monitoring only. All modifications must be authorized via the secure administrative portal.
          </p>
        </div>
      </footer>
    </div>
  );
}
