import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProjectTable from '../components/ProjectTable';
import ProjectModal from '../components/ProjectModal';
import TeamDrawer from '../components/TeamDrawer';
import ActivityLogPanel from '../components/ActivityLogPanel';
import Profile from './Profile';
import UserManagement from './UserManagement';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('projects');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showTeam, setShowTeam] = useState(false);
  const { fetchProjects, fetchStatuses, fetchTeam } = useApp();

  useEffect(() => {
    fetchProjects();
    fetchStatuses();
    fetchTeam();
  }, [fetchProjects, fetchStatuses, fetchTeam]);

  const openAdd = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const VIEW_TITLE = {
    projects: 'Projects',
    activity: 'Activity Logs',
    profile: 'My Profile',
    'user-management': 'User Management',
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onTeamOpen={() => setShowTeam(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={VIEW_TITLE[activeView]}
          onAddProject={activeView === 'projects' ? openAdd : null}
        />

        <main className="flex-1 overflow-auto p-6">
          {activeView === 'projects' && <ProjectTable onEdit={openEdit} />}
          {activeView === 'activity' && <ActivityLogPanel />}
          {activeView === 'profile' && <Profile />}
          {activeView === 'user-management' && <UserManagement />}
        </main>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={closeModal}
        project={editingProject}
      />

      <TeamDrawer
        isOpen={showTeam}
        onClose={() => setShowTeam(false)}
      />
    </div>
  );
}
