import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import AdminLayout from '../../components/Layout/AdminLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface User {
  id: string
  name: string
  email: string
  role: 'CREATOR' | 'PROMOTER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  balanceIdr: number
  totalEarnedIdr: number
  createdAt: string
  lastLoginAt?: string
  campaignsCount?: number
  promotionsCount?: number
}

export default function UsersManagement() {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CREATOR',
      status: 'ACTIVE',
      balanceIdr: 5000000,
      totalEarnedIdr: 0,
      createdAt: '2024-01-15T10:00:00Z',
      lastLoginAt: '2024-01-20T14:30:00Z',
      campaignsCount: 3,
    },
    {
      id: '2',
      name: 'Sarah Kim',
      email: 'sarah@example.com',
      role: 'PROMOTER',
      status: 'ACTIVE',
      balanceIdr: 2500000,
      totalEarnedIdr: 15000000,
      createdAt: '2024-01-10T09:00:00Z',
      lastLoginAt: '2024-01-20T16:45:00Z',
      promotionsCount: 12,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'PROMOTER',
      status: 'SUSPENDED',
      balanceIdr: 0,
      totalEarnedIdr: 3500000,
      createdAt: '2024-01-05T11:00:00Z',
      lastLoginAt: '2024-01-18T10:20:00Z',
      promotionsCount: 5,
    },
    {
      id: '4',
      name: 'Lisa Chen',
      email: 'lisa@example.com',
      role: 'CREATOR',
      status: 'ACTIVE',
      balanceIdr: 8500000,
      totalEarnedIdr: 0,
      createdAt: '2024-01-12T15:30:00Z',
      lastLoginAt: '2024-01-20T12:15:00Z',
      campaignsCount: 7,
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'PROMOTER',
      status: 'BANNED',
      balanceIdr: 0,
      totalEarnedIdr: 1200000,
      createdAt: '2024-01-08T13:45:00Z',
      lastLoginAt: '2024-01-16T09:30:00Z',
      promotionsCount: 2,
    },
  ])

  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  })

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'all' && user.role.toLowerCase() !== filters.role) return false
    if (filters.status !== 'all' && user.status.toLowerCase() !== filters.status) return false
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800'
      case 'BANNED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CREATOR':
        return 'bg-blue-100 text-blue-800'
      case 'PROMOTER':
        return 'bg-purple-100 text-purple-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on users:`, selectedUsers)
    // Here you would implement the bulk action
    setSelectedUsers([])
  }

  return (
    <AdminLayout>
      <Head>
        <title>Users Management - Crebost Admin</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage platform users, their roles, and account status
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Export Users
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                  Add Admin
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="all">All Roles</option>
                  <option value="creator">Creator</option>
                  <option value="promoter">Promoter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} user(s) selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('ban')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(user.balanceIdr)}
                      {user.totalEarnedIdr > 0 && (
                        <div className="text-xs text-gray-500">
                          Earned: {formatCurrency(user.totalEarnedIdr)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role === 'CREATOR' && user.campaignsCount && (
                        <div>{user.campaignsCount} campaigns</div>
                      )}
                      {user.role === 'PROMOTER' && user.promotionsCount && (
                        <div>{user.promotionsCount} promotions</div>
                      )}
                      <div className="text-xs text-gray-500">
                        Last login: {user.lastLoginAt ? formatDate(user.lastLoginAt, 'DISPLAY') : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt, 'DISPLAY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/users/${user.id}`}
                          className="text-red-600 hover:text-red-900"
                        >
                          View
                        </Link>
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        {user.status === 'ACTIVE' ? (
                          <button className="text-yellow-600 hover:text-yellow-900">
                            Suspend
                          </button>
                        ) : (
                          <button className="text-green-600 hover:text-green-900">
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                  <span className="font-medium">{users.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
        permanent: false,
      },
    }
  }

  if (session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}
