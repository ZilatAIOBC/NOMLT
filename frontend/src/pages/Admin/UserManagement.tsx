import { useEffect, useState, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { type User, getUsers, updateUserRole, updateUserStatus } from '../../services/adminUsersService';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ 
        page: pagination.page, 
        limit: pagination.limit,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle page change - Currently disabled, using sample data
  const handlePageChange = (_newPage: number) => {
    // TODO: Enable when backend is ready
  };

  // Handle status update
  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      await updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      fetchUsers();
      setActionMenuOpen(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole} successfully`);
      fetchUsers();
      setActionMenuOpen(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'suspended':
        return 'bg-orange-500/20 text-orange-400';
      case 'deleted':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400';
      case 'user':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    const planLower = plan.toLowerCase();
    if (planLower.includes('pro') || planLower.includes('premium')) {
      return 'bg-purple-500/20 text-purple-400';
    } else if (planLower.includes('basic')) {
      return 'bg-blue-500/20 text-blue-400';
    } else if (planLower.includes('free')) {
      return 'bg-gray-500/20 text-gray-400';
    }
    return 'bg-gray-500/20 text-gray-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400 text-sm md:text-base">Manage users, roles, and permissions.</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0F0F0F] rounded-lg border border-white/10 overflow-hidden">
        {/* Horizontal scroll container for tablet and mobile */}
        <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 text-lg mb-2">No users found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#0F0F0F] border-b border-white/10">
              <tr>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[120px]">NAME</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[180px]">EMAIL</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[80px]">ROLE</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[80px]">STATUS</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[80px]">PLAN</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[80px]">CREDITS</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[100px]">JOIN DATE</th>
                <th className="text-left px-3 md:px-6 py-4 text-gray-400 font-medium text-sm min-w-[80px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs md:text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-white font-medium text-sm md:text-base truncate">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-gray-400 text-sm md:text-base truncate">{user.email}</td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {capitalizeFirst(user.role)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {capitalizeFirst(user.status)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                      {capitalizeFirst(user.plan)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 text-white text-sm md:text-base">{user.credits.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 text-gray-400 text-sm md:text-base">{formatDate(user.joinDate)}</td>
                  <td className="px-3 md:px-6 py-4 relative">
                    <button 
                      onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                      className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                      title="More"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {actionMenuOpen === user.id && (
                      <div 
                        ref={menuRef} 
                        className="absolute right-0 w-48 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-lg z-50"
                        style={{
                          bottom: users.indexOf(user) >= users.length - 2 ? '100%' : 'auto',
                          top: users.indexOf(user) >= users.length - 2 ? 'auto' : '100%',
                          marginTop: users.indexOf(user) >= users.length - 2 ? 'auto' : '8px',
                          marginBottom: users.indexOf(user) >= users.length - 2 ? '8px' : 'auto'
                        }}
                      >
                        <div className="py-1">
                          {user.role === 'user' && (
                            <button
                              onClick={() => handleRoleUpdate(user.id, 'admin')}
                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <button
                              onClick={() => handleRoleUpdate(user.id, 'user')}
                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                            >
                              Remove Admin
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(user.id, 'suspended')}
                              className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-white/5"
                            >
                              Suspend User
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusUpdate(user.id, 'active')}
                              className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-white/5"
                            >
                              Activate User
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-xs md:text-sm">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex gap-1 md:gap-2 overflow-x-auto">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 md:px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 md:px-4 py-2 rounded text-white text-sm whitespace-nowrap ${
                    pagination.page === pageNum
                      ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB]'
                      : 'bg-[#0F0F0F] border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 md:px-4 py-2 bg-[#0F0F0F] border border-white/10 rounded text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

