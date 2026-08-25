import React, { useState, useEffect } from 'react';
import { FileText, Send, X, AlertCircle } from 'lucide-react';

function ApplyModal({ opportunity, token, onSuccess, onClose }) {
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch student's profile to grab their default resume link
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch('/api/students/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.profile) {
          setResumeUrl(data.profile.resumeUrl || '');
        }
      } catch (err) {
        console.error('Error pre-fetching student resume URL:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) {
      fetchStudentProfile();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeUrl) {
      setErrorMsg('Please specify a resume reference URL link.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opportunityId: opportunity._id,
          coverLetter,
          resumeUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setSuccessMsg('Application submitted successfully!');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-3 pr-6">
          <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {opportunity.type} Application
          </span>
          <h3 className="text-lg font-black text-white mt-2">Apply for {opportunity.title}</h3>
          <p className="text-xs text-slate-400 font-extrabold mt-0.5">{opportunity.companyId?.companyName}</p>
        </div>

        {/* Loading Indicator */}
        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            <p className="text-xs">Loading profile parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            {/* Resume Warning Notice */}
            {!resumeUrl && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>No Resume Found:</strong> You do not have a public resume reference saved in your profile. Please paste a link below (e.g. Google Drive, GitHub) to apply.
                </span>
              </div>
            )}

            {/* Resume URL Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Resume Document Link (URL)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  required
                  placeholder="https://drive.google.com/your-resume-link"
                  className="block w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150 font-mono"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Must be a publicly readable link so recruiters can evaluate your application.
              </p>
            </div>

            {/* Cover Letter Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cover Letter / Pitch (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="4"
                placeholder="Pitch yourself to the recruiter. Why are you a good fit for this role?"
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-150"
              />
            </div>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Applying...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default ApplyModal;
