import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Loader2, RefreshCw, Mail, GraduationCap } from 'lucide-react';

function RecruiterApplicants({ opportunity, token, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchApplicants = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`/api/applications/opportunity/${opportunity._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch applicants');
      }
      setApplicants(data.applications || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while loading candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && opportunity) {
      fetchApplicants();
    }
  }, [token, opportunity]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdateMsg('');
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update candidate status');
      }

      // Update state locally
      setApplicants(prev => 
        prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
      );
      setUpdateMsg('Candidate status updated successfully!');
      setTimeout(() => setUpdateMsg(''), 2000);
    } catch (err) {
      alert(err.message || 'Error updating status.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-slate-200 rounded-xl transition border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h3 className="text-lg font-black text-white">Candidate Screening Panel</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Reviewing applicants for: <strong className="text-slate-200">{opportunity.title}</strong> ({opportunity.type})
            </p>
          </div>
        </div>

        <button 
          onClick={fetchApplicants}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-350 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alerts */}
      {updateMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
          {updateMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
          <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
          <p className="text-xs">Fetching candidate profiles...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-400 font-bold text-sm">No Applicants Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            As students browse the opportunities catalog and submit applications, their details and profile parameters will populate here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applicants.map((app) => {
            const studentInfo = app.studentId;
            const userInfo = studentInfo?.userId;

            return (
              <div key={app._id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-750 transition duration-150">
                {/* Applicant Bio & Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-white text-base leading-none">{userInfo?.name || 'Applicant'}</h4>
                      {app.compatibilityScore !== undefined && app.compatibilityScore !== null && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider shrink-0 ${
                          app.compatibilityScore >= 80 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : app.compatibilityScore >= 50 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {app.compatibilityScore}% Compatibility
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span>{userInfo?.email}</span>
                      </span>
                      <span className="hidden sm:inline text-slate-750">•</span>
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                        <span>{studentInfo?.academicInformation?.degree} ({studentInfo?.academicInformation?.branch})</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown Controller */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Recruitment Stage
                    </label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer transition ${
                        app.status === 'accepted' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : app.status === 'rejected' 
                          ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                          : app.status === 'shortlisted' 
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                          : app.status === 'reviewed'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-slate-850 border-slate-700 text-slate-300'
                      }`}
                    >
                      <option value="applied" className="bg-slate-900 text-slate-300">Applied</option>
                      <option value="reviewed" className="bg-slate-900 text-blue-400">Reviewed</option>
                      <option value="shortlisted" className="bg-slate-900 text-indigo-400">Shortlisted</option>
                      <option value="accepted" className="bg-slate-900 text-emerald-400">Accepted</option>
                      <option value="rejected" className="bg-slate-900 text-red-400">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Stats: CGPA & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-900 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 block">Academic CGPA</span>
                    <span className="text-slate-200 font-bold">{studentInfo?.academicInformation?.cgpa ? `${studentInfo.academicInformation.cgpa} / 10` : 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Technical Skills Match</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {studentInfo?.skills && studentInfo.skills.length > 0 ? (
                        studentInfo.skills.map((sk, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] border border-slate-700">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">No skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pitch Letter */}
                {app.coverLetter && (
                  <div className="text-xs bg-slate-900/30 p-3 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block font-bold mb-1 uppercase tracking-wider text-[9px]">Candidate Cover Pitch:</span>
                    <p className="text-slate-300 leading-relaxed italic whitespace-pre-line">
                      "{app.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Actions: Resume document URL */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 text-[10px]">Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 py-1.5 px-4 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition border border-slate-800 shadow-sm cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    <span>View Resume PDF</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecruiterApplicants;
