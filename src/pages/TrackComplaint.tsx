import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

interface ComplaintStatus {
  complaintNumber: string;
  status: 'pending' | 'under_investigation' | 'assigned' | 'resolved' | 'closed';
  submittedDate: string;
  lastUpdated: string;
  victimName: string;
  category: string;
  description: string;
  updates: Array<{
    date: string;
    message: string;
  }>;
}

export function TrackComplaint() {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [complaint, setComplaint] = useState<ComplaintStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const response = await api.trackComplaint(complaintNumber.trim().toUpperCase());
      if (!response?.complaint) {
        setError('Complaint number not found. Please check and try again.');
        return;
      }

      const backendComplaint = response.complaint;
      const updates = (response.updates || []).map((update: { update_date: string; update_message: string }) => ({
        date: new Date(update.update_date).toLocaleDateString('en-IN'),
        message: update.update_message,
      }));

      setComplaint({
        complaintNumber: backendComplaint.complaint_token,
        status: backendComplaint.status,
        submittedDate: backendComplaint.submission_date
          ? new Date(backendComplaint.submission_date).toLocaleDateString('en-IN')
          : 'N/A',
        lastUpdated: backendComplaint.updated_at
          ? new Date(backendComplaint.updated_at).toLocaleDateString('en-IN')
          : 'N/A',
        victimName: backendComplaint.reporter_name,
        category: backendComplaint.incident_type,
        description: backendComplaint.incident_description,
        updates,
      });
    } catch (apiError) {
      console.error('Track complaint failed:', apiError);
      setError('Failed to track complaint right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      under_investigation: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Search },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Search },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
        <p className="text-gray-600 mb-6">Enter your complaint number to track its status</p>

        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={complaintNumber}
              onChange={(e) => setComplaintNumber(e.target.value)}
              placeholder="Enter Complaint Number (e.g., CYB2026001234)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {complaint && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Complaint #{complaint.complaintNumber}
                  </h2>
                  <p className="text-sm text-gray-600">Submitted: {complaint.submittedDate}</p>
                </div>
                {getStatusBadge(complaint.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Victim Name</p>
                  <p className="font-medium text-gray-900">{complaint.victimName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{complaint.category}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{complaint.description}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h3>
              <div className="space-y-4">
                {complaint.updates.map((update, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{update.date}</p>
                      <p className="text-gray-900">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
