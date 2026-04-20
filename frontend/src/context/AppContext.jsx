import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [team, setTeam] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({
    projects: false, statuses: false, projectTypes: false, team: false, logs: false,
  });

  const setLoad = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoad('projects', true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoad('projects', false);
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    setLoad('statuses', true);
    try {
      const res = await api.get('/statuses');
      setStatuses(res.data);
    } catch {
      toast.error('Failed to load statuses');
    } finally {
      setLoad('statuses', false);
    }
  }, []);

  const fetchProjectTypes = useCallback(async () => {
    setLoad('projectTypes', true);
    try {
      const res = await api.get('/project-types');
      setProjectTypes(res.data);
    } catch {
      toast.error('Failed to load project types');
    } finally {
      setLoad('projectTypes', false);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    setLoad('team', true);
    try {
      const res = await api.get('/team');
      setTeam(res.data);
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoad('team', false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoad('logs', true);
    try {
      const res = await api.get('/activity');
      setLogs(res.data.logs);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoad('logs', false);
    }
  }, []);

  // ─── Projects ─────────────────────────────────────────────────────────────
  const createProject = async (data) => {
    const res = await api.post('/projects', data);
    setProjects((prev) => [res.data, ...prev]);
    fetchLogs();
    return res.data;
  };

  const updateProject = async (id, data) => {
    const res = await api.patch(`/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    fetchLogs();
    return res.data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    fetchLogs();
  };

  // ─── Statuses ─────────────────────────────────────────────────────────────
  const createStatus = async (data) => {
    const res = await api.post('/statuses', data);
    setStatuses((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateStatus = async (id, data) => {
    const res = await api.patch(`/statuses/${id}`, data);
    setStatuses((prev) => prev.map((s) => (s._id === id ? res.data : s)));
    return res.data;
  };

  const deleteStatus = async (id) => {
    await api.delete(`/statuses/${id}`);
    setStatuses((prev) => prev.filter((s) => s._id !== id));
  };

  // ─── Project Types ────────────────────────────────────────────────────────
  const createProjectType = async (data) => {
    const res = await api.post('/project-types', data);
    setProjectTypes((prev) => [...prev, res.data]);
    return res.data;
  };

  // ─── Team ─────────────────────────────────────────────────────────────────
  const addMember = async (data) => {
    const res = await api.post('/team', data);
    setTeam((prev) => [res.data, ...prev]);
    fetchLogs();
    return res.data;
  };

  const updateMember = async (id, data) => {
    const res = await api.patch(`/team/${id}`, data);
    setTeam((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    fetchLogs();
    return res.data;
  };

  const deleteMember = async (id) => {
    await api.delete(`/team/${id}`);
    setTeam((prev) => prev.filter((m) => m._id !== id));
    fetchLogs();
  };

  return (
    <AppContext.Provider value={{
      projects, statuses, projectTypes, team, logs, loading,
      fetchProjects, fetchStatuses, fetchProjectTypes, fetchTeam, fetchLogs,
      createProject, updateProject, deleteProject,
      createStatus, updateStatus, deleteStatus,
      createProjectType,
      addMember, updateMember, deleteMember,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
