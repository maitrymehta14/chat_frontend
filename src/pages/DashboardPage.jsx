import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import Card from '../components/ui/Card';
import { 
  Radio, 
  MessageSquare, 
  Zap, 
  ShieldAlert, 
  Layers,
  Clock
} from 'lucide-react';

const DashboardPage = () => {
  const activeRooms = [
    { name: 'general_chat', connections: 412, status: 'Active', color: 'bg-emerald-500' },
    { name: 'telemetry_sync', connections: 890, status: 'Active', color: 'bg-emerald-500' },
    { name: 'billing_updates', connections: 180, status: 'Idle', color: 'bg-amber-500' },
    { name: 'admin_notifications', connections: 0, status: 'Inactive', color: 'bg-slate-700' },
  ];

  const recentEvents = [
    { id: 1, event: 'client_connect', channel: 'general_chat', time: '11:28:10 AM', status: 'Success' },
    { id: 2, event: 'subscribe_channel', channel: 'telemetry_sync', time: '11:29:05 AM', status: 'Success' },
    { id: 3, event: 'auth_handshake', channel: 'admin_notifications', time: '11:32:15 AM', status: 'Failed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, John! Here is your server overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Engine Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Active Sockets"
            value="1,482"
            trend="+8.2%"
            trendType="up"
            icon={Radio}
            iconColorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            description="connections"
          />
          <StatCard
            title="Throughput"
            value="24.8k/s"
            trend="+14.3%"
            trendType="up"
            icon={MessageSquare}
            iconColorClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
            description="messages processed"
          />
          <StatCard
            title="Avg Latency"
            value="14ms"
            trend="-2.1%"
            trendType="up"
            icon={Zap}
            iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            description="round trip duration"
          />
          <StatCard
            title="Error Rate"
            value="0.04%"
            trend="Stable"
            trendType="neutral"
            icon={ShieldAlert}
            iconColorClass="text-red-400 bg-red-500/10 border-red-500/20"
            description="aggregate error rate"
          />
        </div>

        {/* Channels and Activity List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Channels */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-300">Active Channels</h3>
            </div>

            <div className="mt-4 space-y-3">
              {activeRooms.map((room) => (
                <div 
                  key={room.name}
                  className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">#{room.name}</p>
                    <p className="text-xs text-slate-500">{room.connections} connections</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${room.color}`} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {room.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Event Telemetry */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
              <Clock className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-300">Recent Server Events</h3>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800/85">
                    <th className="py-2.5 font-semibold">Event</th>
                    <th className="py-2.5 font-semibold">Channel</th>
                    <th className="py-2.5 font-semibold">Timestamp</th>
                    <th className="py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 text-slate-300">
                  {recentEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/20">
                      <td className="py-3 font-medium text-slate-200">{ev.event}</td>
                      <td className="py-3 text-slate-400">#{ev.channel}</td>
                      <td className="py-3 text-slate-500">{ev.time}</td>
                      <td className="py-3 text-right">
                        <span className={`
                          px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${ev.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}
                        `}>
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
