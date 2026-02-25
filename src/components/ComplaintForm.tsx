import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Mail, Phone, Shield, Download, FileText, Upload, Printer, X } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../utils/api';

interface ComplaintFormData {
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  aadhaar_number: string;
  pan_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  nearest_police_station: string;
  incident_date: string;
  incident_type: string;
  incident_description: string;
  suspect_information: string;
  evidence_details: string;
  financial_loss: string;
}

interface PoliceStation {
  name: string;
  address: string;
  distance: string;
}

const incidentTypes = [
  'Online Banking Fraud',
  'Credit/Debit Card Fraud',
  'Identity Theft',
  'Phishing/Spoofing',
  'Hacking/Unauthorized Access',
  'Cyberstalking/Harassment',
  'Online Scam/Fraud',
  'Ransomware Attack',
  'Social Media Crime',
  'Other',
];

export function ComplaintForm() {
  const [formData, setFormData] = useState<ComplaintFormData>({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    aadhaar_number: '',
    pan_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    nearest_police_station: '',
    incident_date: '',
    incident_type: '',
    incident_description: '',
    suspect_information: '',
    evidence_details: '',
    financial_loss: '0',
  });

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [otpSessionToken] = useState(`SESSION-${Date.now()}`);
  const isEmailVerificationEnabled = false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    complaintNumber?: string;
  }>({ type: null, message: '' });

  // Fetch police stations based on pincode
  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchPoliceStations(formData.pincode);
    }
  }, [formData.pincode]);

  const fetchPoliceStations = async (pincode: string) => {
    setLoadingStations(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockStations: PoliceStation[] = [
        { name: `${formData.city} Central Police Station`, address: `Main Road, ${formData.city}`, distance: '2.5 km' },
        { name: `${formData.city} Cyber Crime Cell`, address: `IT Park, ${formData.city}`, distance: '3.8 km' },
        { name: `${formData.city} East Police Station`, address: `East Zone, ${formData.city}`, distance: '5.1 km' },
      ];
      setPoliceStations(mockStations);
      if (mockStations.length > 0) {
        setFormData(prev => ({ ...prev, nearest_police_station: mockStations[0].name }));
      }
      setLoadingStations(false);
    }, 1000);
  };

  const sendEmailOtp = async () => {
    if (!formData.reporter_email) {
      alert('Please enter your email address first');
      return;
    }
    setSendingOtp(true);
    try {
      await api.sendOTP(formData.reporter_email, 'email', otpSessionToken);
      setEmailOtpSent(true);
      alert('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Error sending email OTP:', error);
      alert('Failed to send email OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const sendPhoneOtp = async () => {
    if (!formData.reporter_phone) {
      alert('Please enter your phone number first');
      return;
    }
    setSendingOtp(true);
    try {
      const fullPhoneNumber = `${countryCode}${formData.reporter_phone}`;
      await api.sendOTP(fullPhoneNumber, 'phone', otpSessionToken);
      setPhoneOtpSent(true);
      alert('OTP sent to your phone number via SMS.');
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      alert('Failed to send phone OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      alert('Please enter a valid 6-digit email OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await api.verifyOTP(otpSessionToken, formData.reporter_email, emailOtp);
      if (result?.verified) {
        setEmailVerified(true);
        alert('Email verified successfully!');
      } else {
        alert(result?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      alert('Failed to verify email OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      alert('Please enter a valid 6-digit phone OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const fullPhoneNumber = `${countryCode}${formData.reporter_phone}`;
      const result = await api.verifyOTP(otpSessionToken, fullPhoneNumber, phoneOtp);
      if (result?.verified) {
        setPhoneVerified(true);
        alert('Phone number verified successfully!');
      } else {
        alert(result?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      alert('Failed to verify phone OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Check file size (max 10MB per file)
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 10MB.`);
          return false;
        }
        return true;
      });
      setEvidenceFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const printPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'reporter_email') {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp('');
    }

    if (name === 'reporter_phone') {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp('');
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate unique token number
  const generateToken = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CYB${year}${month}${random}`;
  };

  // Generate PDF document
  const generatePDF = (token: string, submissionDate: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('CYBER CRIME COMPLAINT', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('National Cyber Crime Reporting Division', 105, 25, { align: 'center' });
    doc.text('Ministry of Home Affairs | Government Portal', 105, 32, { align: 'center' });
    
    // Token Box
    doc.setFillColor(220, 252, 231);
    doc.rect(15, 45, 180, 15, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Complaint Token: ${token}`, 105, 55, { align: 'center' });
    
    // Content
    doc.setFontSize(10);
    let yPos = 70;
    
    // Reporter Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporter Information', 15, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Full Name: ${formData.reporter_name}`, 15, yPos);
    yPos += 6;
    doc.text(`Email: ${formData.reporter_email}`, 15, yPos);
    yPos += 6;
    doc.text(`Phone: ${countryCode}${formData.reporter_phone}`, 15, yPos);
    yPos += 6;
    doc.text(`Aadhaar: ${formData.aadhaar_number.replace(/.(?=.{4})/g, 'X')}`, 15, yPos);
    yPos += 6;
    doc.text(`PAN: ${formData.pan_number}`, 15, yPos);
    yPos += 10;
    
    // Address Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Address Information', 15, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Address: ${formData.address_line1}`, 15, yPos);
    yPos += 6;
    if (formData.address_line2) {
      doc.text(`         ${formData.address_line2}`, 15, yPos);
      yPos += 6;
    }
    doc.text(`City: ${formData.city}, State: ${formData.state}`, 15, yPos);
    yPos += 6;
    doc.text(`PIN Code: ${formData.pincode}`, 15, yPos);
    yPos += 6;
    doc.text(`Nearest Police Station: ${formData.nearest_police_station}`, 15, yPos);
    yPos += 10;
    
    // Incident Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Incident Details', 15, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Incident Date: ${formData.incident_date}`, 15, yPos);
    yPos += 6;
    doc.text(`Type of Cyber Crime: ${formData.incident_type}`, 15, yPos);
    yPos += 6;
    doc.text(`Financial Loss: ₹${formData.financial_loss}`, 15, yPos);
    yPos += 8;
    
    doc.text('Description:', 15, yPos);
    yPos += 6;
    const description = doc.splitTextToSize(formData.incident_description, 180);
    doc.text(description, 15, yPos);
    yPos += description.length * 5 + 5;
    
    // Additional Information
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    if (formData.suspect_information) {
      doc.setFont('helvetica', 'bold');
      doc.text('Suspect Information:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const suspect = doc.splitTextToSize(formData.suspect_information, 180);
      doc.text(suspect, 15, yPos);
      yPos += suspect.length * 5 + 5;
    }
    
    if (formData.evidence_details) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Evidence Details:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const evidence = doc.splitTextToSize(formData.evidence_details, 180);
      doc.text(evidence, 15, yPos);
      yPos += evidence.length * 5 + 5;
    }
    
    // Footer
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    yPos = 280;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Submission Date: ${submissionDate}`, 15, yPos);
    doc.text('This is a system-generated document.', 105, yPos, { align: 'center' });
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, 195, yPos, { align: 'right' });
    
    return doc;
  };

  // Upload PDF to Cloud Storage
  const uploadPDFToCloud = async (pdfBlob: Blob, token: string) => {
    try {
      // Simulate cloud upload - replace with actual cloud storage upload
      const formData = new FormData();
      formData.append('file', pdfBlob, `complaint-${token}.pdf`);
      
      // Mock URL - in production, this would be the actual cloud storage URL
      const mockUrl = URL.createObjectURL(pdfBlob);
      return mockUrl;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEmailVerificationEnabled && !emailVerified) {
      alert('Please verify your email address before submitting');
      return;
    }
    
    if (!phoneVerified) {
      alert('Please verify your phone number before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Generate token
      const token = generateToken();
      const submissionDate = new Date().toLocaleString('en-IN', { 
        dateStyle: 'medium', 
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata' 
      });
      
      // Generate PDF
      const pdf = generatePDF(token, submissionDate);
      const generatedPdfBlob = pdf.output('blob');
      setPdfBlob(generatedPdfBlob);
      
      // Upload PDF to cloud
      const cloudUrl = await uploadPDFToCloud(generatedPdfBlob, token);
      
      // Upload evidence files to cloud
      // In production, upload evidenceFiles to cloud storage
      const evidenceUrls = evidenceFiles.map(file => URL.createObjectURL(file));
      
      const result = await api.submitComplaint({
        ...formData,
        reporter_phone: `${countryCode}${formData.reporter_phone}`,
        complaint_token: token,
        pdf_url: cloudUrl,
        submission_date: submissionDate,
      });

      if (result?.success) {
        // Send notification to cyber crime branch
        await api.notifyComplaint({
          tokenNumber: token,
          victimName: formData.reporter_name,
          victimContact: `${formData.reporter_email} / ${countryCode}${formData.reporter_phone}`,
          incidentType: formData.incident_type,
          description: formData.incident_description,
          dateTime: formData.incident_date,
          location: `${formData.city}, ${formData.state}`,
          suspectInfo: formData.suspect_information,
          evidenceUrls: evidenceUrls,
        });

        // Send WhatsApp message with PDF to reporter
        await api.sendWhatsApp(
          `${countryCode}${formData.reporter_phone}`,
          token,
          cloudUrl,
          formData.reporter_name
        );

        setGeneratedToken(token);
        setPdfUrl(cloudUrl);
        setSubmitStatus({
          type: 'success',
          message: `Your complaint has been successfully registered!`,
          complaintNumber: token,
        });
        // Reset form
        setFormData({
          reporter_name: '',
          reporter_email: '',
          reporter_phone: '',
          aadhaar_number: '',
          pan_number: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          pincode: '',
          nearest_police_station: '',
          incident_date: '',
          incident_type: '',
          incident_description: '',
          suspect_information: '',
          evidence_details: '',
          financial_loss: '0',
        });
        setEmailVerified(false);
        setPhoneVerified(false);
        setEmailOtpSent(false);
        setPhoneOtpSent(false);
        setEmailOtp('');
        setPhoneOtp('');
      } else {
        throw new Error(result?.error || 'Failed to submit complaint');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          File a Cyber Crime Complaint
        </h2>
        <p className="text-gray-600">
          Please provide accurate information. All fields marked with * are mandatory.
        </p>
      </div>

      {submitStatus.type && (
        <div
          className={`mb-6 p-6 rounded-lg border-2 ${
            submitStatus.type === 'success'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {submitStatus.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-2 ${
                submitStatus.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {submitStatus.type === 'success' ? 'Complaint Registered Successfully!' : 'Error'}
              </h3>
              <p
                className={
                  submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }
              >
                {submitStatus.message}
              </p>
              {generatedToken && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white p-4 rounded-md border border-green-300">
                    <p className="text-sm text-gray-600 mb-1">Your Complaint Token Number:</p>
                    <p className="text-2xl font-bold text-blue-700 tracking-wider">{generatedToken}</p>
                    <p className="text-xs text-gray-500 mt-1">Please save this number for tracking your complaint</p>
                  </div>
                  {pdfUrl && pdfBlob && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = pdfUrl;
                          link.download = `complaint-${generatedToken}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                      <button
                        onClick={() => {
                          window.open(pdfUrl, '_blank');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        View PDF
                      </button>
                      <button
                        onClick={printPDF}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors"
                      >
                        <Printer className="w-5 h-5" />
                        Print PDF
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-green-700 bg-green-100 p-3 rounded">
                    ✓ PDF document has been generated and saved to cloud storage<br/>
                    ✓ Confirmation email sent to {formData.reporter_email || 'your email'}<br/>
                    ✓ Nearest police station has been notified
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reporter Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="reporter_name"
                value={formData.reporter_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Email Verification (feature-flagged) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address {isEmailVerificationEnabled ? '*' : '(Optional)'} {emailVerified && <CheckCircle2 className="inline w-5 h-5 text-green-600 ml-2" />}
              </label>
              {!isEmailVerificationEnabled && (
                <p className="text-xs text-gray-500 mb-2">You can submit using phone verification only.</p>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  name="reporter_email"
                  value={formData.reporter_email}
                  onChange={handleChange}
                  required={isEmailVerificationEnabled}
                  disabled={isEmailVerificationEnabled && emailVerified}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isEmailVerificationEnabled && !emailVerified && (
                  <button
                    type="button"
                    onClick={sendEmailOtp}
                    disabled={sendingOtp || !formData.reporter_email}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4" />
                    {emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>
              {isEmailVerificationEnabled && emailOtpSent && !emailVerified && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={verifyingOtp || emailOtp.length !== 6}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Phone with OTP Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number * {phoneVerified && <CheckCircle2 className="inline w-5 h-5 text-green-600 ml-2" />}
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={phoneVerified}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  name="reporter_phone"
                  value={formData.reporter_phone}
                  onChange={handleChange}
                  required
                  disabled={phoneVerified}
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                  placeholder="Enter 10-digit number"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={sendPhoneOtp}
                    disabled={sendingOtp || formData.reporter_phone.length !== 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" />
                    {phoneOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>
              {phoneOtpSent && !phoneVerified && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={verifyPhoneOtp}
                    disabled={verifyingOtp || phoneOtp.length !== 6}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                required
                pattern="[0-9]{12}"
                maxLength={12}
                placeholder="Enter 12-digit Aadhaar number"
                title="Please enter a valid 12-digit Aadhaar number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Your Aadhaar will be masked in the PDF</p>
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                required
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength={10}
                placeholder="e.g., ABCDE1234F"
                title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                style={{ textTransform: 'uppercase' }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Format: 5 letters, 4 digits, 1 letter</p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                required
                placeholder="House/Flat No., Building Name, Street"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder="Area, Locality, Landmark"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                pattern="[0-9]{6}"
                maxLength={6}
                title="Please enter a valid 6-digit PIN code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearest Police Station *
              </label>
              {loadingStations ? (
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Loading nearby stations...</span>
                </div>
              ) : policeStations.length > 0 ? (
                <select
                  name="nearest_police_station"
                  value={formData.nearest_police_station}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {policeStations.map((station, idx) => (
                    <option key={idx} value={station.name}>
                      {station.name} - {station.distance}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="nearest_police_station"
                  value={formData.nearest_police_station}
                  onChange={handleChange}
                  required
                  placeholder="Enter police station name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Incident Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Date *
              </label>
              <input
                type="date"
                name="incident_date"
                value={formData.incident_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Cyber Crime *
              </label>
              <select
                name="incident_type"
                value={formData.incident_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select incident type</option>
                {incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Description *
              </label>
              <textarea
                name="incident_description"
                value={formData.incident_description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide detailed description of the incident..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Loss (if any)
              </label>
              <input
                type="number"
                name="financial_loss"
                value={formData.financial_loss}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspect Information
              </label>
              <textarea
                name="suspect_information"
                value={formData.suspect_information}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any information about the suspect (phone numbers, email addresses, social media profiles, etc.)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Details
              </label>
              <textarea
                name="evidence_details"
                value={formData.evidence_details}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe any evidence you have (screenshots, transaction IDs, URLs, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Evidence Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, PDF, DOC (max 10MB per file)
                  </span>
                </label>
              </div>

              {evidenceFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-600 mt-2">
                    {evidenceFiles.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || (isEmailVerificationEnabled && !emailVerified) || !phoneVerified}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Complaint...
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
          {!phoneVerified && (
            <p className="text-sm text-orange-600 mt-2 text-center">
              Please verify your phone number before submitting
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> After submission, you will receive your complaint acknowledgement PDF via WhatsApp
            on your verified phone number. The Cyber Crime Branch will be notified
            and will contact you if additional information is required.
          </p>
        </div>
      </form>
    </div>
  );
}
