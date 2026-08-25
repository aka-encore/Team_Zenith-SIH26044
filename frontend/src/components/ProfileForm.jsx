import React, { useState } from 'react';
import { 
  Save, Plus, Trash2
} from 'lucide-react';

function ProfileForm({ initialProfile, token, onSaveSuccess }) {
  // Tabs for organizing forms
  const [activeTab, setActiveTab] = useState('academic');

  // Input states
  const [name, setName] = useState(initialProfile?.userId?.name || '');
  const [college, setCollege] = useState(initialProfile?.academicInformation?.college || '');
  const [degree, setDegree] = useState(initialProfile?.academicInformation?.degree || '');
  const [branch, setBranch] = useState(initialProfile?.academicInformation?.branch || '');
  const [year, setYear] = useState(initialProfile?.academicInformation?.year || '');
  const [cgpa, setCgpa] = useState(initialProfile?.academicInformation?.cgpa || '');

  const [skills, setSkills] = useState(initialProfile?.skills?.join(', ') || '');
  const [softSkills, setSoftSkills] = useState(initialProfile?.softSkills?.join(', ') || '');
  const [careerInterests, setCareerInterests] = useState(initialProfile?.careerInterests?.join(', ') || '');
  const [achievements, setAchievements] = useState(initialProfile?.achievements?.join(', ') || '');
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resumeUrl || '');

  // Dynamic Array states
  const [projects, setProjects] = useState(initialProfile?.projects || []);
  const [certifications, setCertifications] = useState(initialProfile?.certifications || []);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Project handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: '', link: '' }
    ]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // Certification handlers
  const handleAddCert = () => {
    setCertifications([
      ...certifications,
      { title: '', issuer: '', date: '' }
    ]);
  };

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleCertChange = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Format comma-separated inputs back to arrays
    const formattedSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const formattedSoftSkills = softSkills ? softSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const formattedInterests = careerInterests ? careerInterests.split(',').map(c => c.trim()).filter(Boolean) : [];
    const formattedAchievements = achievements ? achievements.split(',').map(a => a.trim()).filter(Boolean) : [];

    // Format project technologies (if string, split, else keep as is)
    const formattedProjects = projects.map(proj => {
      let techs = proj.technologies;
      if (typeof techs === 'string') {
        techs = techs.split(',').map(t => t.trim()).filter(Boolean);
      }
      return { ...proj, technologies: techs };
    });

    const payload = {
      name,
      academicInformation: {
        college,
        degree,
        branch,
        year: year ? Number(year) : null,
        cgpa: cgpa ? Number(cgpa) : null
      },
      skills: formattedSkills,
      softSkills: formattedSoftSkills,
      careerInterests: formattedInterests,
      certifications,
      projects: formattedProjects,
      achievements: formattedAchievements,
      resumeUrl
    };

    try {
      const response = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      setSuccessMsg('Profile saved successfully!');
      
      // Update UI in parent component
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Forms Tab Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/40">
        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`flex-1 py-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition ${activeTab === 'academic' ? 'border-indigo-500 text-indigo-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <span>Academic Information</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition ${activeTab === 'skills' ? 'border-indigo-500 text-indigo-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <span>Skills & Interests</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition ${activeTab === 'projects' ? 'border-indigo-500 text-indigo-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <span>Projects & Certs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-4 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition ${activeTab === 'achievements' ? 'border-indigo-500 text-indigo-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <span>Achievements</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
        {/* Success/Error Banner */}
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

        {/* Tab 1: Academic Info */}
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="John Doe"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-1">College Name</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="Indian Institute of Information Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Degree</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="B.Tech"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Branch / Specialization</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="Information Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Academic Year</label>
              <input
                type="number"
                value={year || ''}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="3"
                min="1"
                max="6"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                value={cgpa || ''}
                onChange={(e) => setCgpa(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="8.50"
                min="0"
                max="10"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Skills & Interests */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Technical Skills</label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows="3"
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="JavaScript, React, Node.js, Express, MongoDB (comma-separated)"
              />
              <span className="text-xs text-slate-500 mt-1 block">Separate skills with commas. Use standard tech names for matching compatibility (e.g. React, Node.js).</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Soft Skills</label>
              <input
                type="text"
                value={softSkills}
                onChange={(e) => setSoftSkills(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="Communication, Teamwork, Critical Thinking, Time Management"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Career Interests</label>
              <input
                type="text"
                value={careerInterests}
                onChange={(e) => setCareerInterests(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="Full Stack Developer, DevOps Engineer, Data Analyst"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Projects & Certifications */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Projects list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Key Projects</h3>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-white cursor-pointer transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl text-center border border-dashed border-slate-800">
                  No projects added yet. Click "Add Project" to include your best work.
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl relative space-y-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded cursor-pointer transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                            required
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Collaboration Hub Portal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400">Technologies Used</label>
                          <input
                            type="text"
                            value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                            onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="React, Express, Node.js"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400">Project Description</label>
                          <textarea
                            value={proj.description}
                            onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                            required
                            rows="2"
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Brief details about your project features, architecture, and results..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-400">Project Link (GitHub/Live)</label>
                          <input
                            type="text"
                            value={proj.link || ''}
                            onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications list */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certifications</h3>
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-white cursor-pointer transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Certificate</span>
                </button>
              </div>

              {certifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl text-center border border-dashed border-slate-800">
                  No certifications listed yet. Click "Add Certificate" to list credentials.
                </p>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl relative space-y-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded cursor-pointer transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-10">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400">Certification Name</label>
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => handleCertChange(idx, 'title', e.target.value)}
                            required
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="AWS Cloud Practitioner"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400">Issuing Authority</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)}
                            required
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Amazon Web Services"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400">Date Earned</label>
                          <input
                            type="text"
                            value={cert.date || ''}
                            onChange={(e) => handleCertChange(idx, 'date', e.target.value)}
                            className="block w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MM/YYYY"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Achievements & Resume */}
        {activeTab === 'achievements' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Key Achievements</label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows="3"
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="1st Place in College Hackathon 2025, Selected for national scholarship (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Resume Document URL</label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-155"
                placeholder="https://drive.google.com/your-resume-link"
              />
              <span className="text-xs text-slate-500 mt-1 block">Provide a public link to your resume file (e.g. Google Drive, GitHub page, or LinkedIn portfolio link).</span>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/10 text-sm"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
