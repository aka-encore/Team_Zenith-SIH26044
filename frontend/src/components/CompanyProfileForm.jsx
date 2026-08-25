import React, { useState } from 'react';
import { Save } from 'lucide-react';

function CompanyProfileForm({ initialProfile, token, onSaveSuccess }) {
  // Input states
  const [companyName, setCompanyName] = useState(initialProfile?.companyName || '');
  const [industry, setIndustry] = useState(initialProfile?.industry || '');
  const [description, setDescription] = useState(initialProfile?.description || '');
  const [website, setWebsite] = useState(initialProfile?.website || '');
  const [location, setLocation] = useState(initialProfile?.location || '');
  const [contactPhone, setContactPhone] = useState(initialProfile?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initialProfile?.contactEmail || '');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName) {
      setErrorMsg('Company Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      companyName,
      industry,
      description,
      website,
      location,
      contactPhone,
      contactEmail
    };

    try {
      const response = await fetch('/api/companies/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update company profile.');
      }

      setSuccessMsg('Company profile updated successfully!');
      
      if (onSaveSuccess) {
        onSaveSuccess(data.profile);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
        Edit Company Profile
      </h3>

      {/* Error/Success Alerts */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Company Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="Microsoft Corporation"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Industry Sector</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="Software & Cloud Services"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Company Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="https://www.company.com"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Headquarters Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="Bengaluru, Karnataka"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="recruitment@company.com"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Contact Phone</label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-1">Company Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="block w-full px-3 py-2.5 bg-slate-955/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition duration-155"
            placeholder="Tell students about your company, history, domains, and culture..."
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition duration-155 disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/10 text-sm"
        >
          {saving ? (
            <span>Saving Profile...</span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Company Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CompanyProfileForm;
