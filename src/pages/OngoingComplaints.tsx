import { useState, useEffect } from 'react';
import { Search, Filter, Clock, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface Complaint {
  id: string;
  complaintNumber: string;
  victimName: string;
  category: string;
  status: 'pending' | 'under_investigation' | 'assigned' | 'resolved';
  submittedDate: string;
  priority: 'low' | 'medium' | 'high';
}

export function OngoingComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.getOngoingComplaints();
        const rows = response?.complaints || [];

        const mapped: Complaint[] = rows.map((row: {
          id: number;
          complaint_token: string;
          reporter_name: string;
          incident_type: string;
          status: 'pending' | 'under_investigation' | 'assigned' | 'resolved';
          submission_date: string;
          financial_loss?: number;
        }) => {
          const amount = Number(row.financial_loss || 0);
          const priority: Complaint['priority'] = amount >= 50000 ? 'high' : amount >= 10000 ? 'medium' : 'low';

          return {
            id: String(row.id),
            complaintNumber: row.complaint_token,
            victimName: row.reporter_name,
            category: row.incident_type,
            status: row.status,
            submittedDate: row.submission_date
              ? new Date(row.submission_date).toLocaleDateString('en-IN')
              : 'N/A',
            priority,
          };
        });

        setComplaints(mapped);
        setFilteredComplaints(mapped);
      } catch (error) {
        console.error('Failed to fetch ongoing complaints:', error);
        setComplaints([]);
        setFilteredComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.victimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, complaints]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_investigation: 'bg-blue-100 text-blue-800',
      assigned: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return badges[status as keyof typeof badges];
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };
    return badges[priority as keyof typeof badges];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ongoing Complaints</h1>
        <p className="text-gray-600 mb-6">View and manage all active cyber crime complaints</p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by complaint number, name, or category..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No complaints found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Victim Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {complaint.complaintNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.victimName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {complaint.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {complaint.submittedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(
                          complaint.priority
                        )}`}
                      >
                        {complaint.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </p>
        </div>
      </div>
    </div>
  );
}
