import { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

function TeamStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 shadow-sm flex items-center gap-4 group hover:border-indigo-500/50 transition-all">
      <div className={`w-10 h-10 rounded-none ${color} flex items-center justify-center text-lg shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Team() {
  const { team, projects, addMember, deleteMember } = useApp();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Developer' });
  const [submitting, setSubmitting] = useState(false);

  const isMaster = user?.role === 'MASTER_ADMIN';

  // ─── Analytics ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const loadMap = {};
    projects.forEach(p => {
      p.assignedPeople?.forEach(ap => {
        const key = ap.email || ap.name;
        loadMap[key] = (loadMap[key] || 0) + 1;
      });
    });

    const highLoadCount = team.filter(m => (loadMap[m.email] || 0) > 2).length;
    const uniqueRoles = new Set(team.map(m => m.role)).size;
    const newThisMonth = team.filter(m => {
      const date = new Date(m.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: team.length,
      highLoad: highLoadCount,
      roles: uniqueRoles,
      recent: newThisMonth,
      loadMap
    };
  }, [team, projects]);

  // ─── Chart Data (Compact) ─────────────────────────────────────────────────
  const chartOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
    colors: ['#6366f1'],
    xaxis: { 
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: false },
    grid: { show: false },
    theme: { mode: 'dark' },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark', x: { show: false } }
  };

  const chartSeries = [{ name: 'Members', data: [4, 6, 8, 9, 11, team.length] }];

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addMember(form);
      toast.success('Personnel Enrolled');
      setShowAdd(false);
      setForm({ name: '', email: '', role: 'Developer' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteMember(id);
      toast.success('Record Deleted');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Personnel Directory</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Project Load Monitoring System</p>
        </div>
        {isMaster && (
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] px-5 py-3 shadow-lg active:scale-95 transition-all"
          >
            + New Member
          </button>
        )}
      </div>

      {/* Stats Row - 4 Cards */}
      <div className="grid grid-cols-1 ssm:grid-cols-2 md:grid-cols-4 gap-4">
        <TeamStatCard title="Total Force" value={stats.total} icon="👥" color="bg-indigo-500/10 text-indigo-500" />
        <TeamStatCard title="Role Types" value={stats.roles} icon="🛠️" color="bg-emerald-500/10 text-emerald-500" />
        <TeamStatCard title="High Load" value={stats.highLoad} icon="⚡" color="bg-amber-500/10 text-amber-500" />
        <TeamStatCard title="Recent" value={stats.recent} icon="📈" color="bg-purple-500/10 text-purple-500" />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Assignment Matrix</h3>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-800">
            <table className="w-full min-w-[600px] lg:min-w-0">
              <thead>
                <tr className="bg-gray-800/20 text-left border-b border-gray-800">
                  <th className="px-6 py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest">Identity</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Load</th>
                  {isMaster && <th className="px-6 py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest text-right">Ops</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {team.map((member) => {
                  const load = stats.loadMap[member.email] || 0;
                  return (
                    <tr key={member._id} className="hover:bg-gray-800/10 transition-colors">
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex w-7 h-7 bg-gray-800 border border-gray-700 items-center justify-center text-[9px] font-black text-gray-400">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-white uppercase tracking-tight truncate">{member.name}</div>
                            <div className="text-[9px] text-gray-600 font-medium truncate">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-950/20 px-2 py-0.5 border border-indigo-900/20">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-[10px] font-bold ${load > 2 ? 'text-amber-500' : 'text-gray-500'}`}>{load}</span>
                          <div className="w-12 h-1 bg-gray-800 overflow-hidden">
                            <div 
                              className={`h-full ${load > 2 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${Math.min(load * 25, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      {isMaster && (
                        <td className="px-4 md:px-6 py-3 text-right">
                          <button 
                            onClick={() => handleDelete(member._id)}
                            className="text-[9px] font-black text-gray-700 hover:text-red-500 transition-colors uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Small Graph */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 border border-gray-800 p-5 shadow-xl">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 text-center">Growth Velocity</h3>
            <div className="h-[160px]">
              <ReactApexChart options={chartOptions} series={chartSeries} type="area" height="100%" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                <span className="text-gray-500">Utilization</span>
                <span className="text-indigo-400">76.4%</span>
              </div>
              <div className="w-full h-1 bg-gray-800">
                <div className="w-[76%] h-full bg-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/10 border border-indigo-900/20 p-4">
             <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Efficiency Protocol</h4>
             <p className="text-[10px] text-gray-500 leading-tight italic">
               Personnel with high load are flagged. Optimize distribution for peak performance.
             </p>
          </div>
        </div>
      </div>

      {/* High-Fidelity Team Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <div className="relative bg-[#030712] border border-gray-800 rounded-none w-full max-w-lg shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300">
            {/* Premium Header */}
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900/50 to-transparent">
              <div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Enroll Personnel</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Specialized Entry</p>
              </div>
              <button 
                onClick={() => setShowAdd(false)} 
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-900 border border-gray-800 text-gray-500 hover:text-white transition-all transform hover:rotate-90"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="px-6 md:px-8 py-6 md:py-8 space-y-5 md:space-y-6">
              {/* Name Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Identity</label>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Required</span>
                </div>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  placeholder="ENTER FULL NAME"
                  className="w-full bg-gray-900 border border-gray-800 rounded-none px-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-700 outline-none focus:border-indigo-600 transition-all font-bold tracking-tight shadow-inner"
                />
              </div>
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Digital Address</label>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Unique</span>
                </div>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                  placeholder="NAME@ORGANIZATION.COM"
                  className="w-full bg-gray-900 border border-gray-800 rounded-none px-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-700 outline-none focus:border-indigo-600 transition-all font-bold tracking-tight shadow-inner"
                />
              </div>
              
              {/* Role Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Designation</label>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Assigned</span>
                </div>
                <input 
                  type="text" 
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  required
                  placeholder="e.g. PROJECT MANAGER"
                  className="w-full bg-gray-900 border border-gray-800 rounded-none px-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-700 outline-none focus:border-indigo-600 transition-all font-bold tracking-tight shadow-inner"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-800/50">
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 bg-gray-900 text-gray-600 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] border border-gray-800 hover:text-white transition-all active:scale-95"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 bg-indigo-600 text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 transition-all disabled:opacity-50 active:scale-95 border border-indigo-500/20"
                >
                  {submitting ? 'PROCESSING...' : 'AUTHORIZE ENTRY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
