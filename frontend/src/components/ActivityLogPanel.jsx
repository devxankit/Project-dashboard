import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const ACTION_META = {
  CREATE_PROJECT:  { label: 'created project',   color: 'text-green-400',  bg: 'bg-green-950/40 border-green-900/50',  dot: 'bg-green-500' },
  UPDATE_PROJECT:  { label: 'updated project',   color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50',    dot: 'bg-blue-500' },
  DELETE_PROJECT:  { label: 'deleted project',   color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50',      dot: 'bg-red-500' },
  PROJECT_STATUS_CHANGE: { label: 'changed status', color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-900/50', dot: 'bg-indigo-500' },
  CREATE_STATUS:   { label: 'created status',    color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-900/50', dot: 'bg-purple-500' },
  UPDATE_STATUS:   { label: 'updated status',    color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50',    dot: 'bg-blue-500' },
  DELETE_STATUS:   { label: 'deleted status',    color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50',      dot: 'bg-red-500' },
  CREATE_PROJECT_TYPE: { label: 'created type', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-900/50', dot: 'bg-emerald-500' },
  UPDATE_PROJECT_TYPE: { label: 'updated type', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-900/50', dot: 'bg-blue-500' },
  DELETE_PROJECT_TYPE: { label: 'deleted type', color: 'text-red-400', bg: 'bg-red-950/40 border-red-900/50', dot: 'bg-red-500' },
  ADD_MEMBER:      { label: 'added member',      color: 'text-green-400',  bg: 'bg-green-950/40 border-green-900/50',  dot: 'bg-green-500' },
  UPDATE_MEMBER:   { label: 'updated member',    color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50',    dot: 'bg-blue-500' },
  DELETE_MEMBER:   { label: 'removed member',    color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50',      dot: 'bg-red-500' },
  PROMOTE_USER:    { label: 'promoted',          color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-900/50', dot: 'bg-yellow-500' },
  DEMOTE_USER:     { label: 'demoted',           color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-900/50', dot: 'bg-orange-500' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export default function ActivityLogPanel() {
  const { logs, loading, fetchLogs } = useApp();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!log) return false;
    const s = search.toLowerCase();
    const adminName = (log.adminName || '').toLowerCase();
    const target = (log.target || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const actionLabel = (ACTION_META[log.action]?.label || '').toLowerCase();

    return (
      adminName.includes(s) ||
      target.includes(s) ||
      action.includes(s) ||
      actionLabel.includes(s)
    );
  });

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-white uppercase tracking-tight">Activity Logs</h3>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 uppercase tracking-widest font-bold">
            Real-time track
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading.logs}
          className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-white transition-colors px-2 md:px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50"
        >
          <svg
            className={`w-3 h-3 md:w-3.5 md:h-3.5 ${loading.logs ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search activity by name, project, or action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 pl-10 text-xs md:text-sm text-white outline-none focus:border-indigo-500 transition-colors"
        />
        <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Log List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading.logs && logs.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No activity recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/80">
            {filteredLogs.map((log) => {
              const meta = ACTION_META[log.action] ?? {
                label: log.action, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', dot: 'bg-gray-500',
              };
              return (
                <div
                  key={log._id}
                  className="px-4 md:px-5 py-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Dot */}
                    <div className="mt-2 shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs md:text-sm">
                        <span className="font-semibold text-white uppercase tracking-tight">{log.adminName}</span>
                        <span className={`${meta.color} font-medium`}>{meta.label}</span>
                        <span className="font-bold text-gray-400">"{log.target}"</span>
                      </div>

                      {/* Changed fields */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className={`mt-2 px-3 py-2 rounded-lg border text-[10px] space-y-1.5 ${meta.bg}`}>
                          {Object.entries(log.changes).map(([key, val]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-400">
                              <span className="font-bold text-gray-300 uppercase shrink-0 min-w-[70px]">{key}:</span>
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="opacity-60 truncate max-w-[120px] line-through decoration-red-500/50">{String(val?.from ?? 'None')}</span>
                                <span className="text-indigo-500 font-bold shrink-0">→</span>
                                <span className="text-white font-semibold truncate max-w-[150px]">{String(val?.to ?? 'None')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <span className="w-1 h-1 bg-gray-800 rounded-full" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{timeAgo(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
