import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const ACTION_META = {
  CREATE_PROJECT:  { label: 'created project',   color: 'text-green-400',  bg: 'bg-green-950/40 border-green-900/50',  dot: 'bg-green-500' },
  UPDATE_PROJECT:  { label: 'updated project',   color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50',    dot: 'bg-blue-500' },
  DELETE_PROJECT:  { label: 'deleted project',   color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50',      dot: 'bg-red-500' },
  CREATE_STATUS:   { label: 'created status',    color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-900/50', dot: 'bg-purple-500' },
  UPDATE_STATUS:   { label: 'updated status',    color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50',    dot: 'bg-blue-500' },
  DELETE_STATUS:   { label: 'deleted status',    color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50',      dot: 'bg-red-500' },
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

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Activity Logs</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            All admin actions tracked in real time
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading.logs}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading.logs ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
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
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/80">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] ?? {
                label: log.action, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', dot: 'bg-gray-500',
              };
              return (
                <div
                  key={log._id}
                  className="px-5 py-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Dot */}
                    <div className="mt-1.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap text-sm">
                        <span className="font-semibold text-white">{log.adminName}</span>
                        <span className={meta.color}>{meta.label}</span>
                        <span className="font-medium text-gray-200">"{log.target}"</span>
                      </div>

                      {/* Changed fields */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className={`mt-2 px-3 py-2 rounded-lg border text-xs space-y-1 ${meta.bg}`}>
                          {Object.entries(log.changes).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2 text-gray-400">
                              <span className="font-medium text-gray-300">{key}</span>
                              <span>changed</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-gray-600 mt-1.5">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {' · '}
                        <span className="text-gray-500">{timeAgo(log.createdAt)}</span>
                      </p>
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
