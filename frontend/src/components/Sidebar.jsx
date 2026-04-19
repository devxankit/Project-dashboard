import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'user-management', label: 'User Management', masterOnly: true },
  { id: 'activity', label: 'Activity Logs' },
];

export default function Sidebar({ activeView, setActiveView, onTeamOpen, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const isMaster = user?.role === 'MASTER_ADMIN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between group">
          <div>
            <h1 className="text-base font-bold text-white leading-tight uppercase tracking-widest text-indigo-500">ProjDash</h1>
            <p className="text-[10px] text-gray-500 leading-tight">Management System</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            if (item.masterOnly && !isMaster) return null;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'team') onTeamOpen();
                  else setActiveView(item.id);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${
                  activeView === item.id || (item.id === 'team' && activeView === 'team')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 truncate underline decoration-indigo-900">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-[10px] uppercase tracking-widest font-black text-gray-600 hover:text-red-400 transition-colors py-1 flex items-center gap-2"
          >
            <span>→</span> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
