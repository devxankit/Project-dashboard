import { useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import useLiveTimer from '../hooks/useLiveTimer';
import { formatDate, isOverdue, getInitials } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function ProjectRow({ project, onEdit }) {
  const { user } = useAuth();
  const { updateProject, deleteProject } = useApp();
  const elapsed = useLiveTimer(project.startDate);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN';
  const overdue = isOverdue(project.deadline) && project.progress < 100;

  const handleProgressChange = async (val) => {
    try {
      await updateProject(project._id, { progress: val });
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProject(project._id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
      setDeleting(false);
    }
  };

  return (
    <tr className="border-b border-gray-800/80 hover:bg-gray-800/30 transition-colors group">
      {/* Name */}
      <td className="px-4 py-3.5">
        <div className="font-medium text-white text-sm leading-tight">{project.name}</div>
        <div className="text-[11px] text-gray-500 mt-0.5">by {project.createdBy?.name}</div>
      </td>

      {/* Start Date */}
      <td className="px-4 py-3.5 text-sm text-gray-400 whitespace-nowrap">
        {formatDate(project.startDate)}
      </td>

      {/* Deadline */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className={`text-sm ${overdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
          {formatDate(project.deadline)}
          {overdue && <span className="ml-1 text-xs">⚠</span>}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={project.status} />
      </td>

      {/* Assigned People */}
      <td className="px-4 py-3.5">
        {project.assignedPeople?.length === 0 ? (
          <span className="text-xs text-gray-600">Unassigned</span>
        ) : (
          <div className="flex -space-x-1.5">
            {project.assignedPeople?.slice(0, 5).map((p) => (
              <div
                key={p._id}
                title={`${p.name} — ${p.role}`}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0 cursor-default"
              >
                {getInitials(p.name)}
              </div>
            ))}
            {project.assignedPeople?.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-[10px] text-gray-400">
                +{project.assignedPeople.length - 5}
              </div>
            )}
          </div>
        )}
      </td>

      {/* Remarks */}
      <td className="px-4 py-3.5 max-w-[160px]">
        <p className="text-xs text-gray-400 truncate" title={project.remarks || ''}>
          {project.remarks || <span className="text-gray-600">—</span>}
        </p>
      </td>

      {/* Progress */}
      <td className="px-4 py-3.5">
        <ProgressBar
          progress={project.progress}
          editable={canEdit}
          onChange={handleProgressChange}
        />
      </td>

      {/* Live Timer */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-xs font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 px-2 py-1 rounded-md">
          {elapsed}
        </span>
      </td>

      {/* Actions */}
      {canEdit && (
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
              title="Edit project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors disabled:opacity-40"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
