import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import AdminLayout from '../../components/Layout/AdminLayout'
import { formatDate } from '@crebost/shared'

interface Report {
  id: string
  reporter: {
    id: string
    name: string
    email: string
  }
  reportedUser: {
    id: string
    name: string
    email: string
    role: string
  }
  reportedContent?: {
    id: string
    type: 'CAMPAIGN' | 'PROMOTION' | 'USER_PROFILE'
    title: string
  }
  reason: 'SPAM' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'FAKE_METRICS' | 'OTHER'
  description: string
  evidenceUrls?: string[]
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: {
    name: string
  }
  resolutionNotes?: string
}

export default function ReportsManagement() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      reporter: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      reportedUser: {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'PROMOTER',
      },
      reportedContent: {
        id: 'promo-1',
        type: 'PROMOTION',
        title: 'Tech Product Review Promotion',
      },
      reason: 'FAKE_METRICS',
      description: 'This user is reporting fake view counts and engagement metrics. The numbers don\'t match with actual platform analytics.',
      evidenceUrls: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
      status: 'PENDING',
      priority: 'HIGH',
      createdAt: '2024-01-20T14:30:00Z',
    },
    {
      id: '2',
      reporter: {
        id: '4',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
      },
      reportedUser: {
        id: '5',
        name: 'David Wilson',
        email: 'david@example.com',
        role: 'PROMOTER',
      },
      reason: 'SPAM',
      description: 'User is sending spam messages and inappropriate content in campaign applications.',
      status: 'INVESTIGATING',
      priority: 'MEDIUM',
      createdAt: '2024-01-19T10:15:00Z',
    },
    {
      id: '3',
      reporter: {
        id: '6',
        name: 'Tom Wilson',
        email: 'tom@example.com',
      },
      reportedUser: {
        id: '7',
        name: 'Anna Davis',
        email: 'anna@example.com',
        role: 'CREATOR',
      },
      reportedContent: {
        id: 'camp-1',
        type: 'CAMPAIGN',
        title: 'Fashion Brand Campaign',
      },
      reason: 'INAPPROPRIATE_CONTENT',
      description: 'Campaign contains inappropriate content that violates community guidelines.',
      status: 'RESOLVED',
      priority: 'HIGH',
      createdAt: '2024-01-18T16:45:00Z',
      resolvedAt: '2024-01-19T09:30:00Z',
      resolvedBy: {
        name: 'Admin User',
      },
      resolutionNotes: 'Campaign content has been reviewed and updated to comply with guidelines.',
    },
    {
      id: '4',
      reporter: {
        id: '8',
        name: 'Emma Brown',
        email: 'emma@example.com',
      },
      reportedUser: {
        id: '9',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'PROMOTER',
      },
      reason: 'FRAUD',
      description: 'Suspected fraudulent activity in promotion submissions.',
      status: 'DISMISSED',
      priority: 'LOW',
      createdAt: '2024-01-17T11:20:00Z',
      resolvedAt: '2024-01-18T14:15:00Z',
      resolvedBy: {
        name: 'Admin User',
      },
      resolutionNotes: 'Investigation completed. No evidence of fraudulent activity found.',
    },
  ])

  const [filter, setFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'resolve' | 'dismiss' | null, report: Report | null }>({ type: null, report: null })
  const [resolutionNotes, setResolutionNotes] = useState('')

  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.status.toLowerCase() !== filter) return false
    if (priorityFilter !== 'all' && report.priority.toLowerCase() !== priorityFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'INVESTIGATING':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return 'Spam'
      case 'FRAUD':
        return 'Fraud'
      case 'INAPPROPRIATE_CONTENT':
        return 'Inappropriate Content'
      case 'FAKE_METRICS':
        return 'Fake Metrics'
      case 'OTHER':
        return 'Other'
      default:
        return reason
    }
  }

  const handleAction = (type: 'resolve' | 'dismiss', report: Report) => {
    setActionModal({ type, report })
    setResolutionNotes('')
  }

  const confirmAction = () => {
    if (!actionModal.report || !resolutionNotes.trim()) return

    console.log(`${actionModal.type} report ${actionModal.report.id}`, {
      resolutionNotes,
    })

    // Here you would make API call to process the report
    setActionModal({ type: null, report: null })
    setResolutionNotes('')
  }

  const pendingReports = reports.filter(r => r.status === 'PENDING').length
  const investigatingReports = reports.filter(r => r.status === 'INVESTIGATING').length
  const urgentReports = reports.filter(r => r.priority === 'URGENT').length

  return (
    <AdminLayout>
      <Head>
        <title>Reports Management - Crebost Admin</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Reports Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and investigate user reports and violations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Reports</dt>
                      <dd className="text-lg font-medium text-gray-900">{pendingReports}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Investigating</dt>
                      <dd className="text-lg font-medium text-gray-900">{investigatingReports}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Urgent Priority</dt>
                      <dd className="text-lg font-medium text-gray-900">{urgentReports}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                      <dd className="text-lg font-medium text-gray-900">{reports.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilter('all')
                      setPriorityFilter('all')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <li key={report.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                              {report.priority}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-red-600">
                              {getReasonLabel(report.reason)}
                            </p>
                            {report.reportedContent && (
                              <span className="ml-2 text-sm text-gray-500">
                                • {report.reportedContent.type}: {report.reportedContent.title}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Reported by {report.reporter.name} against {report.reportedUser.name} ({report.reportedUser.role})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(report.status === 'PENDING' || report.status === 'INVESTIGATING') && (
                          <>
                            <button
                              onClick={() => handleAction('resolve', report)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleAction('dismiss', report)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Reported on {formatDate(report.createdAt, 'DISPLAY_WITH_TIME')}</p>
                      </div>
                      {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                        <div className="flex items-center text-sm text-blue-600">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>{report.evidenceUrls.length} evidence file(s)</p>
                        </div>
                      )}
                    </div>

                    {report.resolutionNotes && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Resolution:</span> {report.resolutionNotes}
                        </p>
                        {report.resolvedBy && report.resolvedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Resolved by {report.resolvedBy.name} on {formatDate(report.resolvedAt, 'DISPLAY_WITH_TIME')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No reports match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.report && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionModal.type === 'resolve' ? 'Resolve' : 'Dismiss'} Report
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Report: <span className="font-medium">{getReasonLabel(actionModal.report.reason)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Reported User: <span className="font-medium">{actionModal.report.reportedUser.name}</span>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Explain the resolution or reason for dismissal..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmAction}
                  disabled={!resolutionNotes.trim()}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${
                    actionModal.type === 'resolve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Confirm {actionModal.type === 'resolve' ? 'Resolution' : 'Dismissal'}
                </button>
                <button
                  onClick={() => setActionModal({ type: null, report: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                      {selectedReport.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-sm text-gray-900">{getReasonLabel(selectedReport.reason)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reporter</label>
                  <p className="text-sm text-gray-900">{selectedReport.reporter.name} ({selectedReport.reporter.email})</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reported User</label>
                  <p className="text-sm text-gray-900">{selectedReport.reportedUser.name} ({selectedReport.reportedUser.email}) - {selectedReport.reportedUser.role}</p>
                </div>

                {selectedReport.reportedContent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reported Content</label>
                    <p className="text-sm text-gray-900">{selectedReport.reportedContent.type}: {selectedReport.reportedContent.title}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedReport.description}</p>
                </div>

                {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Evidence</label>
                    <div className="space-y-2">
                      {selectedReport.evidenceUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-800"
                        >
                          Evidence {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.resolutionNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                    <p className="text-sm text-gray-900">{selectedReport.resolutionNotes}</p>
                    {selectedReport.resolvedBy && selectedReport.resolvedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resolved by {selectedReport.resolvedBy.name} on {formatDate(selectedReport.resolvedAt, 'DISPLAY_WITH_TIME')}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Reported on {formatDate(selectedReport.createdAt, 'DISPLAY_WITH_TIME')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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