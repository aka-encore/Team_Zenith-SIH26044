import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

function OpportunityForm({ opportunity, token, onSaveSuccess, onCancel }) {
  const isEdit = !!opportunity;

  // Form states
  const [title, setTitle] = useState(opportunity?.title || '');
  const [type, setType] = useState(opportunity?.type || 'internship');
  const [description, setDescription] = useState(opportunity?.description || '');
  const [location, setLocation] = useState(opportunity?.location || 'Remote');
  const [stipend, setStipend] = useState(opportunity?.stipend || 'Competitive');
  const [duration, setDuration] = useState(opportunity?.duration || '');
  const [requiredSkills, setRequiredSkills] = useState(
    opportunity?.requiredSkills ? opportunity.requiredSkills.join(', ') : ''
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !requiredSkills) {
      setErrorMsg('Title, Description, and Required Skills are required fields.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Parse comma-separated skills
    const skillsArray = requiredSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      type,
      description,
      location,
      stipend,
      duration: ['internship', 'fdp', 'research'].includes(type) ? duration : '', // Duration is relevant for internships, FDPs and research projects
      requiredSkills: skillsArray
    };

    try {
      const url = isEdit ? `/api/opportunities/${opportunity._id}` : '/api/opportunities';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit opportunity.');
      }

      setSuccessMsg(isEdit ? 'Opportunity updated successfully!' : 'Opportunity posted successfully!');
      
      if (onSaveSuccess) {
        // Delay slightly so the user sees the success message before dashboard updates
        setTimeout(() => {
          onSaveSuccess(data.opportunity);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while saving opportunity details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-black text-white">
          {isEdit ? 'Edit Opportunity Posting' : 'Post New Opportunity'}
        </h3>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Position Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="block w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
            placeholder="e.g. Front-End React Developer Intern"
          />
        </div>

        {/* Type & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Opportunity Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
            >
              <option value="internship">Internship Opportunity</option>
              <option value="job">Full-time Job Opening</option>
              <option value="fdp">Faculty Development Programme (FDP)</option>
              <option value="research">Collaborative Research / Consultancy Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
              placeholder="e.g. Remote, Bangalore Office"
            />
          </div>
        </div>

        {/* Stipend & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Compensation / Stipend
            </label>
            <input
              type="text"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
              placeholder="e.g. ₹20,000 / month, Competitive"
            />
          </div>

          {['internship', 'fdp', 'research'].includes(type) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Programme / Internship Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required={['internship', 'fdp', 'research'].includes(type)}
                className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
                placeholder="e.g. 6 Months, 2 Weeks, 1 Year"
              />
            </div>
          )}
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Required Skills (Comma separated)
          </label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            required
            className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
            placeholder="e.g. React, Node.js, REST APIs, Git"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Separate tags with commas. These will be parsed into badges and used to calculate student compatibility matching.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Job / Role Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="5"
            className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-150"
            placeholder="Outline daily responsibilities, ideal candidate qualities, perks, and apply criteria..."
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3 text-xs">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? (
              <span>Saving Posting...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEdit ? 'Save Changes' : 'Post Opportunity'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OpportunityForm;
