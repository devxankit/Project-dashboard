import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Navbar({ title, onAddProject }) {
  const { user } = useAuth();
  const { projects } = useApp();
  const isAdmin = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN';

  return (
    <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {title === 'Projects' && (
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && onAddProject && (
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/30"
          >
            <span className="text-base leading-none">+</span>
            Add Project
          </button>
        )}
      </div>
    </header>
  );
}
