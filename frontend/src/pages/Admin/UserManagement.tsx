import { MoreVertical, Download, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Suspended';
  plan: 'Pro' | 'Basic';
  credits: number;
  joinDate: string;
}

export default function UserManagement() {

  // Sample data - replace with actual API call
  const users: User[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Admin',
      status: 'Active',
      plan: 'Pro',
      credits: 1240,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'User',
      status: 'Active',
      plan: 'Basic',
      credits: 980,
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      role: 'User',
      status: 'Suspended',
      plan: 'Pro',
      credits: 856,
      joinDate: '2024-01-08',
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james@example.com',
      role: 'User',
      status: 'Active',
      plan: 'Basic',
      credits: 742,
      joinDate: '2024-03-12',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'Suspended':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/20 text-purple-400';
      case 'User':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Pro':
        return 'bg-purple-500/20 text-purple-400';
      case 'Basic':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage users, roles, and permissions.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>


      {/* Users Table */}
      <div className="bg-[#0F0F0F] rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0F0F0F] border-b border-white/10">
            <tr>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">NAME</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">EMAIL</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">ROLE</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">STATUS</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">PLAN</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">CREDITS</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">JOIN DATE</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{user.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{user.credits.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-400">{user.joinDate}</td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="More">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-gray-400 text-sm">Showing 1 to 4 of 12,847 users</div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5">
            Previous
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] rounded text-white">1</button>
          <button className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5">
            2
          </button>
          <button className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5">
            3
          </button>
          <button className="px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

