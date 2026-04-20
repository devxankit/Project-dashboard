import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProjectTable from '../components/ProjectTable';
import ProjectModal from '../components/ProjectModal';
import Profile from './Profile';
import UserManagement from './UserManagement';
import Overview from './Overview';
import Team from './Team';
import ActivityLogPanel from '../components/ActivityLogPanel';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fetchProjects, fetchStatuses, fetchProjectTypes, fetchTeam } = useApp();

  useEffect(() => {
    fetchProjects();
    fetchStatuses();
    fetchProjectTypes();
    fetchTeam();
  }, [fetchProjects, fetchStatuses, fetchProjectTypes, fetchTeam]);

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
    overview: 'Overview',
    team: 'Team Management',
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        onTeamOpen={() => {
          setActiveView('team');
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={VIEW_TITLE[activeView]}
          onAddProject={activeView === 'projects' ? openAdd : null}
          setActiveView={setActiveView}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-6">
          {activeView === 'overview' && <Overview />}
          {activeView === 'projects' && <ProjectTable onEdit={openEdit} />}
          {activeView === 'activity' && <ActivityLogPanel />}
          {activeView === 'profile' && <Profile />}
          {activeView === 'user-management' && <UserManagement />}
          {activeView === 'team' && <Team />}
        </main>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={closeModal}
        project={editingProject}
      />
    </div>
  );
}
