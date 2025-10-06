import { StatsGrid } from '../../components/admin/StatsGrid';
import { TopUsedFeatures } from '../../components/admin/TopUsedFeatures';
import { ActiveUsers } from '../../components/admin/ActiveUsers';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Monitor and manage your platform</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopUsedFeatures />
        <ActiveUsers />
      </div>
    </div>
  );
}

