import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const NAV = [
  { id: 'projects', label: 'Projects', icon: '📋' },
  { id: 'activity', label: 'Activity Logs', icon: '📊' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
];

export default function Sidebar({ activeView, setActiveView, onTeamOpen }) {
  const { user, logout } = useAuth();
  const isMaster = user?.role === 'MASTER_ADMIN';

  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">ProjDash</h1>
            <p className="text-[10px] text-gray-500 leading-tight">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {isMaster && (
          <button
            onClick={() => setActiveView('user-management')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'user-management'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-base">🔑</span>
            User Management
          </button>
        )}

        {/* Team — all admins can view, but only MASTER_ADMIN can modify */}
        <button
          onClick={onTeamOpen}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span className="text-base">👥</span>
          Team
        </button>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-indigo-400 truncate">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-gray-600 hover:text-red-400 transition-colors py-1 flex items-center gap-1.5"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>
  );
}
