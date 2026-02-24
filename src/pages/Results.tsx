import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download, Search, Mail, Phone, Shield, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../utils/api';

interface ResolvedComplaint {
  id: string;
  complaintNumber: string;
  victimName: string;
  category: string;
  submittedDate: string;
  resolvedDate: string;
  resolution: string;
  outcome: 'successful' | 'unsuccessful';
  actionTaken: string;
  email?: string;
  phone?: string;
}

export function Results() {
  const [complaints, setComplaints] = useState<ResolvedComplaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<ResolvedComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Verification states
  const [tokenNumber, setTokenNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [contactInfo, setContactInfo] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setVerified(false);
  }, [tokenNumber, contactInfo, verificationMethod]);

  useEffect(() => {
    // Only load complaints after verification
    if (verified) {
      setLoading(true);
      api
        .getResolvedComplaints(tokenNumber, contactInfo)
        .then((response) => {
          if (!response?.success || !response?.complaint) {
            setComplaints([]);
            setFilteredComplaints([]);
            return;
          }

          const mapped: ResolvedComplaint = {
            id: String(response.complaint.id),
            complaintNumber: response.complaint.complaint_token,
            victimName: response.complaint.reporter_name,
            category: response.complaint.incident_type,
            submittedDate: response.complaint.submission_date
              ? new Date(response.complaint.submission_date).toLocaleDateString('en-IN')
              : 'N/A',
            resolvedDate: response.resolution?.resolution_date
              ? new Date(response.resolution.resolution_date).toLocaleDateString('en-IN')
              : 'N/A',
            resolution: response.resolution?.resolution_description || 'Resolution details not available',
            outcome: response.resolution?.resolution_status === 'successful' ? 'successful' : 'unsuccessful',
            actionTaken: response.resolution?.action_taken || 'No additional action details available',
            email: response.complaint.reporter_email,
            phone: response.complaint.reporter_phone,
          };

          setComplaints([mapped]);
          setFilteredComplaints([mapped]);
        })
        .catch((error) => {
          console.error('Failed to fetch resolved complaint:', error);
          setComplaints([]);
          setFilteredComplaints([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [verified, tokenNumber, contactInfo]);

  const sendOtp = async () => {
    if (!tokenNumber || !contactInfo) {
      alert('Please enter token number and contact information');
      return;
    }
    setSendingOtp(true);
    try {
      await api.sendOTP(contactInfo, verificationMethod, tokenNumber);
      setOtpSent(true);
      alert(`OTP sent to your ${verificationMethod === 'email' ? 'email' : 'phone number'}`);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);
    try {
      const result = await api.verifyOTP(tokenNumber, contactInfo, otp);
      if (result?.verified) {
        setVerified(true);
        alert('Verification successful!');
      } else {
        alert(result?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      alert('Failed to verify OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const generatePDF = (complaint: ResolvedComplaint) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('COMPLAINT RESOLUTION REPORT', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('National Cyber Crime Reporting Division', 105, 25, { align: 'center' });
    doc.text('Ministry of Home Affairs', 105, 32, { align: 'center' });
    
    // Status Badge
    const isSuccess = complaint.outcome === 'successful';
    if (isSuccess) {
      doc.setFillColor(220, 252, 231);
    } else {
      doc.setFillColor(254, 226, 226);
    }
    doc.rect(15, 45, 180, 15, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Status: ${isSuccess ? 'SUCCESSFULLY RESOLVED' : 'CASE CLOSED'}`, 105, 55, { align: 'center' });
    
    // Content
    doc.setFontSize(10);
    let yPos = 70;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Complaint Number: ${complaint.complaintNumber}`, 15, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Victim Name: ${complaint.victimName}`, 15, yPos);
    yPos += 6;
    doc.text(`Category: ${complaint.category}`, 15, yPos);
    yPos += 6;
    doc.text(`Submitted Date: ${complaint.submittedDate}`, 15, yPos);
    yPos += 6;
    doc.text(`Resolved Date: ${complaint.resolvedDate}`, 15, yPos);
    yPos += 12;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Resolution:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const resolution = doc.splitTextToSize(complaint.resolution, 180);
    doc.text(resolution, 15, yPos);
    yPos += resolution.length * 5 + 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Action Taken:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const action = doc.splitTextToSize(complaint.actionTaken, 180);
    doc.text(action, 15, yPos);
    yPos += action.length * 5 + 10;
    
    // Footer
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 15, yPos);
    doc.text('This is a system-generated document.', 105, yPos, { align: 'center' });
    
    return doc;
  };

  const handleDownloadReport = (complaint: ResolvedComplaint) => {
    const pdf = generatePDF(complaint);
    pdf.save(`resolution-${complaint.complaintNumber}.pdf`);
  };

  const handlePrintReport = (complaint: ResolvedComplaint) => {
    const pdf = generatePDF(complaint);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  };

  const handleViewReport = (complaint: ResolvedComplaint) => {
    const pdf = generatePDF(complaint);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Results</h1>
        <p className="text-gray-600 mb-6">View the resolution and outcome of your cyber crime complaint</p>

        {!verified ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Verify Your Identity</h2>
              <p className="text-blue-700 mb-4">
                Please enter your complaint token number and verify your identity to view the results.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Token Number *
                  </label>
                  <input
                    type="text"
                    value={tokenNumber}
                    onChange={(e) => setTokenNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., CYB2026001100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Method *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={verificationMethod === 'email'}
                        onChange={(e) => setVerificationMethod(e.target.value as 'email' | 'phone')}
                        className="mr-2"
                      />
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        checked={verificationMethod === 'phone'}
                        onChange={(e) => setVerificationMethod(e.target.value as 'email' | 'phone')}
                        className="mr-2"
                      />
                      <Phone className="w-4 h-4 mr-1" />
                      Phone
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {verificationMethod === 'email' ? 'Email Address' : 'Phone Number'} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={verificationMethod === 'email' ? 'email' : 'tel'}
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder={verificationMethod === 'email' ? 'your@email.com' : '9876543210'}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {!otpSent && (
                      <button
                        onClick={sendOtp}
                        disabled={sendingOtp || !tokenNumber || !contactInfo}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 whitespace-nowrap"
                      >
                        {sendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={verifyOtp}
                        disabled={verifying || otp.length !== 6}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        {verifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <button
                      onClick={sendOtp}
                      disabled={sendingOtp}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading complaint results...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No resolved complaints found</p>
              </div>
            ) : (
              <div className="space-y-6">{filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {complaint.complaintNumber}
                      </h3>
                      {complaint.outcome === 'successful' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Successful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Unsuccessful
                        </span>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Victim:</span>{' '}
                        <span className="font-medium text-gray-900">{complaint.victimName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>{' '}
                        <span className="font-medium text-gray-900">{complaint.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Resolved:</span>{' '}
                        <span className="font-medium text-gray-900">{complaint.resolvedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleDownloadReport(complaint)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleViewReport(complaint)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handlePrintReport(complaint)}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Resolution:</p>
                    <p className="text-gray-900">{complaint.resolution}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Action Taken:</p>
                    <p className="text-gray-900">{complaint.actionTaken}</p>
                  </div>
                </div>
              </div>
            ))}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
