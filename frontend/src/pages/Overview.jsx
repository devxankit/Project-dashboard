import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import api from '../api';
import toast from 'react-hot-toast';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/stats');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    { 
      label: 'Total Projects', 
      value: stats.summary.totalProjects, 
      color: 'indigo', 
      icon: '📊',
      progress: Math.min((stats.summary.totalProjects / 50) * 100, 100)
    },
    { 
      label: 'Urgent Priority', 
      value: stats.summary.urgentCount, 
      color: 'red', 
      icon: '🔥',
      progress: stats.summary.totalProjects > 0 ? (stats.summary.urgentCount / stats.summary.totalProjects) * 100 : 0
    },
    { 
      label: 'Created (7d)', 
      value: stats.summary.recentCount, 
      color: 'green', 
      icon: '✨',
      progress: stats.summary.totalProjects > 0 ? (stats.summary.recentCount / stats.summary.totalProjects) * 100 : 0
    },
    { 
      label: 'Avg Progress', 
      value: `${stats.summary.avgProgress || 0}%`, 
      color: 'purple', 
      icon: '📈',
      progress: stats.summary.avgProgress || 0 
    }, 
  ];

  const PRIORITY_COLORS = {
    low: '#94a3b8',
    normal: '#6366f1',
    high: '#f59e0b',
    urgent: '#ef4444'
  };

  // Chart Configurations
  const growthChartOptions = {
    chart: {
      id: 'growth-chart',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif'
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#6366f1']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100],
        colorStops: [
          { offset: 0, color: "#6366f1", opacity: 0.4 },
          { offset: 100, color: "#6366f1", opacity: 0 }
        ]
      }
    },
    xaxis: {
      categories: stats.growthStats.map(g => g.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '12px' } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '12px' } }
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4,
      padding: { left: 20, right: 20 }
    },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
    theme: { mode: 'dark' }
  };

  const statusPieOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels: stats.statusStats.map(s => s.name.toUpperCase()),
    colors: stats.statusStats.map(s => s.color),
    stroke: { show: false },
    legend: {
      position: 'bottom',
      labels: { colors: '#94a3b8' },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'PROJECTS',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 600,
              formatter: () => stats.summary.totalProjects
            },
            value: {
              show: true,
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 700
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  };

  const priorityBarOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
        distributed: true,
      }
    },
    colors: stats.priorityStats.map(p => PRIORITY_COLORS[p._id] || '#6366f1'),
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: stats.priorityStats.map(p => p._id.toUpperCase()),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '11px', fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '12px' } }
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4,
    },
    tooltip: { theme: 'dark' }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">System Analytics</h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Advanced project metrics and distribution analysis.</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-gray-900 border border-gray-800 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Server Status: </span>
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Operational</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-gray-900/50 border border-gray-800 p-5 md:p-6 rounded-3xl hover:border-gray-700 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
                <h4 className="text-2xl md:text-3xl font-black text-white">{card.value}</h4>
              </div>
              <span className="text-xl md:text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">{card.icon}</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative z-10">
               <div 
                 className={`h-full bg-${card.color}-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000`} 
                 style={{ width: `${card.progress}%` }}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Modern ApexCharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Spline Area Chart */}
        <div className="lg:col-span-8 bg-gray-900/50 border border-gray-800 p-5 md:p-8 rounded-3xl hover:border-gray-700/50 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] md:text-[11px] font-extrabold text-white uppercase tracking-[0.2em]">Growth Trend</h4>
            <span className="text-[9px] text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded-lg">LIVE</span>
          </div>
          <div className="h-[250px] md:h-[320px] w-full">
            <Chart
              options={growthChartOptions}
              series={[{ name: 'Projects Created', data: stats.growthStats.map(g => g.count) }]}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="lg:col-span-4 bg-gray-900/50 border border-gray-800 p-5 md:p-8 rounded-3xl hover:border-gray-700/50 transition-colors">
          <h4 className="text-[10px] md:text-[11px] font-extrabold text-white uppercase tracking-[0.2em] mb-8">Distribution</h4>
          <div className="h-[250px] md:h-[320px] w-full flex items-center justify-center">
            <Chart
              options={statusPieOptions}
              series={stats.statusStats.map(s => s.count)}
              type="donut"
              width="100%"
            />
          </div>
        </div>

        {/* Priority Column Chart */}
        <div className="lg:col-span-12 bg-gray-900/50 border border-gray-800 p-5 md:p-8 rounded-3xl hover:border-gray-700/50 transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] md:text-[11px] font-extrabold text-white uppercase tracking-[0.2em]">Priority Allocation</h4>
            <p className="hidden sm:block text-[10px] text-gray-500 font-medium">Visualizing task density across urgency levels</p>
          </div>
          <div className="h-[200px] md:h-[280px] w-full">
            <Chart
              options={priorityBarOptions}
              series={[{ name: 'Projects', data: stats.priorityStats.map(p => p.count) }]}
              type="bar"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
