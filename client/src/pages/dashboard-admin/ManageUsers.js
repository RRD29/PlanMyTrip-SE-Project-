import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';

// --- MOCK DATA (Remove when API is ready) ---
const MOCK_USERS = [
  { _id: 'u1', fullName: 'Alice Smith', email: 'alice@example.com', role: 'user', createdAt: '2025-10-20T10:00:00Z' },
  { _id: 'u2', fullName: 'Bob Johnson', email: 'bob@example.com', role: 'guide', createdAt: '2025-10-19T11:30:00Z' },
  { _id: 'u3', fullName: 'Charlie Brown', email: 'charlie@example.com', role: 'user', createdAt: '2025-10-18T14:15:00Z' },
  { _id: 'u4', fullName: 'David Lee', email: 'david@example.com', role: 'guide', createdAt: '2025-10-17T09:05:00Z' },
];
// ---------------------------------------------

// Skeleton row for loading state
const UserRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-3/4" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-full" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-1/2" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-5 w-3/4" /></td>
    <td className="px-6 py-4 whitespace-nowrap"><SkeletonText className="h-8 w-24" /></td>
  </tr>
);

const ManageUsers = () => {
  // const { data: users, loading, error } = useApi('/admin/users'); // Real API call
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSuspendUser = (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      // API call to suspend user
      console.log(`Suspending user ${userId}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
      
      {/* TODO: Add Search/Filter Bar */}
      
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        {error && <p className="text-red-500 p-4">Error fetching users: {error}</p>}
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <>
                <UserRowSkeleton />
                <UserRowSkeleton />
                <UserRowSkeleton />
              </>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'guide' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="danger" size="sm" onClick={() => handleSuspendUser(user._id)}>
                      Suspend
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;