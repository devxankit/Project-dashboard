import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Navbar({ title, onAddProject, setActiveView, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { projects } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN';

  return (
    <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-sm md:text-base font-semibold text-white truncate max-w-[120px] md:max-w-none">{title}</h2>
        {title === 'Projects' && (
          <span className="text-[10px] md:text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && onAddProject && (
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/30"
          >
            <span className="text-base leading-none">+</span>
            Add Project
          </button>
        )}

        {/* User Info & Dropdown */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-800 relative">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white leading-none uppercase tracking-widest">{user?.name}</p>
          </div>
          
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-gray-800 hover:border-indigo-500 transition-all active:scale-95"
          >
            {user?.name?.[0]?.toUpperCase()}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-gray-800 mb-1 sm:hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase">{user?.role}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setActiveView('profile');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                >
                  My Profile
                </button>
                
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
