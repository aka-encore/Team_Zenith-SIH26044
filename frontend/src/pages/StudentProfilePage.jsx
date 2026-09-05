import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import {
  User, Mail, Phone, Calendar, School, BookOpen, GraduationCap, Award,
  Briefcase, Globe, FileText, ExternalLink, Edit3,
  CheckCircle2, AlertCircle, Loader2, Plus, Trash2, Save, X, Sparkles,
  Layers, Code2, ShieldCheck, ArrowRight, RefreshCw, Camera, UploadCloud,
  FolderGit2, Link as LinkIcon, Eye, Download, HardDrive, FileCheck,
  FileWarning, Check, Copy
} from 'lucide-react';


const GithubIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);


export default function StudentProfilePage() {
  const { token, user: authUser, updateUser } = useAuth();

  // Active section tab: 'personal' | 'projects' | 'certifications' | 'resume' | 'social'
  const [activeTab, setActiveTab] = useState('personal');

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── 1. Profile Photo Upload State ──
  const photoInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  // ── 2. Personal & Academic Edit Modal State ──
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
    college: '',
    department: '',
    course: '',
    year: '',
    cgpa: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });

  // ── 3. Projects State ──
  const [projectsList, setProjectsList] = useState([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectDetailModalOpen, setProjectDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologiesInput: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    duration: ''
  });
  const [savingProject, setSavingProject] = useState(false);

  // ── 4. Certifications State ──
  const [certificationsList, setCertificationsList] = useState([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certDetailModalOpen, setCertDetailModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: ''
  });
  const [savingCert, setSavingCert] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // ── 5. Resume State ──
  const resumeInputRef = useRef(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [resumePreviewModalOpen, setResumePreviewModalOpen] = useState(false);

  // ── 6. Skill Passport State ──
  const [passportData, setPassportData] = useState(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportCopied, setPassportCopied] = useState(false);

  const fetchSkillPassport = async () => {
    setPassportLoading(true);
    try {
      const res = await fetch('/api/students/skill-passport', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPassportData(data.passport);
      }
    } catch (err) {
      console.error('Error fetching skill passport:', err);
    } finally {
      setPassportLoading(false);
    }
  };

  const handlePrintPassport = () => {
    window.print();
  };

  const handleCopyPassportLink = () => {
    const url = `${window.location.origin}/profile`;
    navigator.clipboard.writeText(url);
    setPassportCopied(true);
    setSuccessMsg('Skill Passport shareable link copied to clipboard!');
    setTimeout(() => {
      setPassportCopied(false);
      setSuccessMsg('');
    }, 3000);
  };

  // Fetch full student profile and all submodules from real MongoDB backend
  const fetchAllProfileData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [profRes, projRes, certRes, resumeRes] = await Promise.all([
        fetch('/api/students/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/students/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/students/certifications', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/students/resume', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const profData = await profRes.json();
      const projData = await projRes.json();
      const certData = await certRes.json();
      const resumeDataRes = await resumeRes.json();

      if (profData.success) {
        const p = profData.profile;
        setProfile(p);
        setFormData({
          name: p.userId?.name || authUser?.name || '',
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          bio: p.bio || '',
          college: p.academicInformation?.college || '',
          department: p.academicInformation?.department || p.academicInformation?.branch || '',
          course: p.academicInformation?.course || p.academicInformation?.degree || '',
          year: p.academicInformation?.year || '',
          cgpa: p.academicInformation?.cgpa !== null && p.academicInformation?.cgpa !== undefined ? p.academicInformation.cgpa : '',
          github: p.socialLinks?.github || '',
          linkedin: p.socialLinks?.linkedin || '',
          portfolio: p.socialLinks?.portfolio || ''
        });
      }

      if (projData.success) setProjectsList(projData.projects || []);
      if (certData.success) setCertificationsList(certData.certifications || []);
      if (resumeDataRes.success) setResumeData(resumeDataRes.resume || null);

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setErrorMsg('Failed to load student profile details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllProfileData();
    }
  }, [token]);

  // ── PHOTO UPLOAD HANDLERS ──
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setAvatarLoadFailed(false);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadingPhoto(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('photo', file);

      const res = await fetch('/api/students/upload-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to upload photo');

      setProfile(prev => ({
        ...prev,
        profilePhoto: resData.photoUrl,
        userId: { ...(prev?.userId || {}), avatarUrl: resData.photoUrl }
      }));
      if (updateUser) {
        updateUser({ avatarUrl: resData.photoUrl });
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setAvatarLoadFailed(false);
      setSuccessMsg('Profile photo uploaded and updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error uploading profile photo');
      setPreviewUrl(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setUploadingPhoto(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('photo', selectedFile);

      const res = await fetch('/api/students/upload-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.message || 'Failed to upload photo');

      setProfile(prev => ({
        ...prev,
        profilePhoto: resData.photoUrl,
        userId: { ...(prev?.userId || {}), avatarUrl: resData.photoUrl }
      }));
      if (updateUser) {
        updateUser({ avatarUrl: resData.photoUrl });
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setAvatarLoadFailed(false);
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error uploading profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── PROFILE UPDATE HANDLER ──
  const openEditModal = () => {
    if (profile) {
      setFormData({
        name: profile.userId?.name || authUser?.name || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        bio: profile.bio || '',
        college: profile.academicInformation?.college || '',
        department: profile.academicInformation?.department || profile.academicInformation?.branch || '',
        course: profile.academicInformation?.course || profile.academicInformation?.degree || '',
        year: profile.academicInformation?.year || '',
        cgpa: profile.academicInformation?.cgpa !== null && profile.academicInformation?.cgpa !== undefined ? profile.academicInformation.cgpa : '',
        github: profile.socialLinks?.github || '',
        linkedin: profile.socialLinks?.linkedin || '',
        portfolio: profile.socialLinks?.portfolio || ''
      });
    }
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        bio: formData.bio.trim(),
        academicInformation: {
          college: formData.college.trim(),
          department: formData.department.trim(),
          course: formData.course.trim(),
          year: formData.year.trim(),
          cgpa: formData.cgpa !== '' && formData.cgpa !== null && formData.cgpa !== undefined ? parseFloat(formData.cgpa) : null
        },
        socialLinks: {
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          portfolio: formData.portfolio.trim()
        },
        college: formData.college.trim(),
        department: formData.department.trim(),
        course: formData.course.trim(),
        year: formData.year.trim(),
        cgpa: formData.cgpa !== '' && formData.cgpa !== null && formData.cgpa !== undefined ? parseFloat(formData.cgpa) : null,
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        portfolio: formData.portfolio.trim()
      };

      const res = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update profile');

      if (data.profile) {
        const p = data.profile;
        setProfile(p);
        setFormData({
          name: p.userId?.name || formData.name || '',
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          bio: p.bio || '',
          college: p.academicInformation?.college || '',
          department: p.academicInformation?.department || p.academicInformation?.branch || '',
          course: p.academicInformation?.course || p.academicInformation?.degree || '',
          year: p.academicInformation?.year || '',
          cgpa: p.academicInformation?.cgpa !== null && p.academicInformation?.cgpa !== undefined ? p.academicInformation.cgpa : '',
          github: p.socialLinks?.github || '',
          linkedin: p.socialLinks?.linkedin || '',
          portfolio: p.socialLinks?.portfolio || ''
        });
      }
      if (updateUser && formData.name.trim()) {
        updateUser({ name: formData.name.trim() });
      }
      setEditModalOpen(false);
      setSuccessMsg('Profile updated and saved to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // ── PROJECT CRUD HANDLERS ──
  const openAddProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      description: '',
      technologiesInput: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      duration: ''
    });
    setProjectModalOpen(true);
  };

  const openEditProject = (p) => {
    setEditingProjectId(p._id);
    setProjectForm({
      title: p.title || '',
      description: p.description || '',
      technologiesInput: (p.technologies || []).join(', '),
      technologies: p.technologies || [],
      githubUrl: p.githubUrl || p.link || '',
      liveUrl: p.liveUrl || '',
      duration: p.duration || ''
    });
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      setErrorMsg('Project title and description are required.');
      return;
    }

    setSavingProject(true);
    const techArray = projectForm.technologiesInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const url = editingProjectId ? `/api/students/projects/${editingProjectId}` : '/api/students/projects';
      const method = editingProjectId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          technologies: techArray,
          githubUrl: projectForm.githubUrl.trim(),
          liveUrl: projectForm.liveUrl.trim(),
          duration: projectForm.duration.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save project.');

      setProjectsList(data.projects || []);
      setProjectModalOpen(false);
      setSuccessMsg(editingProjectId ? 'Project updated in MongoDB!' : 'Project added to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/students/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProjectsList(data.projects || []);
        setSuccessMsg('Project removed from MongoDB.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Error deleting project.');
    }
  };

  // ── CERTIFICATIONS CRUD HANDLERS ──
  const openAddCert = () => {
    setEditingCertId(null);
    setCertForm({
      title: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      credentialUrl: ''
    });
    setCertModalOpen(true);
  };

  const openEditCert = (c) => {
    setEditingCertId(c._id);
    setCertForm({
      title: c.title || '',
      issuer: c.issuer || '',
      issueDate: c.issueDate || (c.date ? new Date(c.date).toISOString().split('T')[0] : ''),
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || c.link || ''
    });
    setCertModalOpen(true);
  };

  const handleSaveCert = async (e) => {
    e.preventDefault();
    if (!certForm.title.trim() || !certForm.issuer.trim()) {
      setErrorMsg('Certificate name and issuing organization are required.');
      return;
    }

    setSavingCert(true);
    try {
      const url = editingCertId ? `/api/students/certifications/${editingCertId}` : '/api/students/certifications';
      const method = editingCertId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(certForm)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save certificate.');

      setCertificationsList(data.certifications || []);
      setCertModalOpen(false);
      setSuccessMsg(editingCertId ? 'Certificate updated in MongoDB!' : 'Certificate added to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving certificate.');
    } finally {
      setSavingCert(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const res = await fetch(`/api/students/certifications/${certId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCertificationsList(data.certifications || []);
        setSuccessMsg('Certificate removed from MongoDB.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Error deleting certificate.');
    }
  };

  // ── RESUME HANDLERS ──
  const handleResumeFileSelect = async (file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg('Invalid file format. Please upload a PDF resume (.pdf only).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Resume file size must be less than 10MB.');
      return;
    }

    setUploadingResume(true);
    setErrorMsg('');
    try {
      const form = new FormData();
      form.append('resume', file);

      const res = await fetch('/api/students/upload-resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to upload resume.');

      setResumeData(data.resume);
      setSuccessMsg('Resume PDF uploaded and saved successfully to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error uploading resume.');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    setDeletingResume(true);
    try {
      const res = await fetch('/api/students/resume', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setResumeData({ resumeUrl: '', resumeName: '', resumeUploadDate: '', resumeSize: '' });
        setSuccessMsg('Resume deleted from MongoDB.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Error deleting resume.');
    } finally {
      setDeletingResume(false);
    }
  };

  const currentPhoto = previewUrl || profile?.profilePhoto || profile?.userId?.avatarUrl || authUser?.avatarUrl;
  const displayName = profile?.userId?.name || authUser?.name || 'Student';
  const displayEmail = profile?.userId?.email || authUser?.email || '';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-left">
      
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={(e) => handleResumeFileSelect(e.target.files?.[0])}
        accept="application/pdf"
        className="hidden"
      />

      {/* ── 1. HERO PROFILE HEADER CARD ── */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 text-center sm:text-left">
          
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="relative">
              <UserAvatar
                src={currentPhoto}
                name={displayName}
                size={100}
                role="student"
                fallbackLetter="S"
                style={{ borderRadius: '24px', boxShadow: '0 8px 24px rgba(22, 163, 106, 0.25)' }}
              />

              {uploadingPhoto && (
                <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-1 z-20 text-white">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">Saving...</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setAvatarLoadFailed(false);
                photoInputRef.current?.click();
              }}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              title="Upload Profile Photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 justify-center sm:justify-start">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-extrabold flex items-center space-x-1.5 uppercase tracking-wider font-mono shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Student Record</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {displayName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold">
              {profile?.academicInformation?.department || 'Computer Science'} • {profile?.academicInformation?.college || 'SkillNexus AI Institute'}
            </p>

            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 justify-center sm:justify-start pt-1 font-mono font-medium">
              <span className="flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{displayEmail}</span>
              </span>
              {profile?.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{profile.phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Save CTA / Edit Profile Button */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 relative z-10">
          {previewUrl && (
            <button
              onClick={handleUploadPhoto}
              disabled={uploadingPhoto}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2 cursor-pointer"
            >
              {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{uploadingPhoto ? 'Saving Photo...' : 'Save New Photo'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('passport');
              fetchSkillPassport();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-purple-600/20 transition flex items-center space-x-2 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Skill Passport</span>
          </button>

          <button
            onClick={openEditModal}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:text-emerald-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:text-rose-900 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── 2. SECTION TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto text-xs font-bold pb-px">
        {[
          { id: 'personal', label: 'Personal & Academic', icon: User },
          { id: 'passport', label: 'Skill Passport', icon: ShieldCheck, highlight: true },
          { id: 'projects', label: `Projects (${projectsList.length})`, icon: FolderGit2 },
          { id: 'certifications', label: `Certifications (${certificationsList.length})`, icon: Award },
          { id: 'resume', label: 'Resume', icon: FileText },
          { id: 'social', label: 'Social Links', icon: Globe }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'passport' && !passportData) fetchSkillPassport();
            }}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : tab.highlight
                  ? 'border-transparent text-purple-600 dark:text-purple-400 hover:text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${tab.highlight && activeTab !== tab.id ? 'text-purple-500' : ''}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 1: PERSONAL & ACADEMIC ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'personal' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="p-6 sm:p-7 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <User className="h-4 w-4" />
                  </div>
                  <span>Personal Information</span>
                </h3>
                <button onClick={openEditModal} className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Full Name</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{displayName}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Email</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{displayEmail}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Phone Number</span>
                  <p className="font-bold text-slate-900 dark:text-white">{profile?.phone || 'Not provided'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Date of Birth</span>
                  <p className="font-bold text-slate-900 dark:text-white">{profile?.dateOfBirth || 'Not provided'}</p>
                </div>
              </div>

              {profile?.bio && (
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Bio</span>
                  <p className="text-slate-800 dark:text-slate-300 leading-relaxed font-medium">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Academic Information */}
            <div className="p-6 sm:p-7 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span>Academic Information</span>
                </h3>
                <button onClick={openEditModal} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl text-xs font-bold transition cursor-pointer">
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1 col-span-2">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">College / University</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {profile?.academicInformation?.college || 'SkillNexus AI Institute'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Department</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {profile?.academicInformation?.department || profile?.academicInformation?.branch || 'Computer Science'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Course / Degree</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {profile?.academicInformation?.course || profile?.academicInformation?.degree || 'B.Tech'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Current Year</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {profile?.academicInformation?.year ? `${profile.academicInformation.year} Year` : '3rd Year'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-1">
                  <span className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">CGPA</span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {profile?.academicInformation?.cgpa !== null && profile?.academicInformation?.cgpa !== undefined
                      ? `${profile.academicInformation.cgpa} / 10.0`
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB: SKILL PASSPORT ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'passport' && (
        <div className="space-y-6 animate-in fade-in text-left">
          
          {/* Action Bar (Download / Print / Share) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-purple-500/20 no-print shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono">
                  Official Digital Skill Passport
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive digital credential generated directly from your real verified MongoDB academic & skill records.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={handleCopyPassportLink}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                {passportCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                <span>{passportCopied ? 'Link Copied!' : 'Share Passport'}</span>
              </button>

              <button
                onClick={handlePrintPassport}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 shadow-md shadow-purple-600/25 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download / Print Passport</span>
              </button>
            </div>
          </div>

          {passportLoading ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="h-7 w-7 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider">Generating Real Skill Passport...</p>
            </div>
          ) : (
            <div id="skill-passport-view" className="space-y-6">
              
              {/* ── PASSPORT HERO CARD ── */}
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-white via-slate-50/80 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-[#0f172a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden shrink-0 border-2 border-white dark:border-slate-800">
                      {currentPhoto && !avatarLoadFailed ? (
                        <img src={currentPhoto} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{displayName?.charAt(0)?.toUpperCase() || 'S'}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 justify-center sm:justify-start">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 font-mono font-extrabold uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                          <ShieldCheck className="h-3 w-3 text-purple-500" />
                          <span>Verified Talent Passport</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {passportData?.passportId || `ZN-PASS-${profile?._id?.toString().slice(-6).toUpperCase()}`}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {displayName}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold">
                        {passportData?.education?.degree || profile?.academicInformation?.degree || 'Bachelor of Technology'} • {passportData?.education?.department || profile?.academicInformation?.department || 'Computer Science & Engineering'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {passportData?.education?.college || profile?.academicInformation?.college || 'Zenith Institute of Technology'} {profile?.academicInformation?.cgpa ? `• CGPA: ${profile.academicInformation.cgpa}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Career Readiness Badge in Passport */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-purple-500/20 shadow-md text-center md:text-right space-y-1 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                      Career Readiness Index
                    </span>
                    <div className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                      {passportData?.careerReadiness?.score || 85}%
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-block">
                      {passportData?.careerReadiness?.tier || 'Workplace Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 4 SECTION GRID ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Verified Skills & Proficiencies */}
                <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Layers className="h-4 w-4 text-purple-500" />
                      <span>Verified Skills & Proficiency ({passportData?.skills?.length || (profile?.skills || []).length})</span>
                    </h3>
                  </div>

                  {(!passportData?.skills || passportData.skills.length === 0) && (!profile?.skills || profile.skills.length === 0) ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No skills added to profile yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {(passportData?.skills || (profile?.skills || []).map(s => ({ name: typeof s === 'string' ? s : s.name, proficiency: s.proficiency || 'Intermediate' }))).map((sk, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 dark:text-white">{sk.name}</span>
                            {sk.isAssessmentVerified && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold flex items-center space-x-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span>Exam Verified</span>
                              </span>
                            )}
                          </div>

                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold border ${
                            sk.proficiency === 'Expert' || sk.proficiency === 'Advanced'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : sk.proficiency === 'Intermediate'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}>
                            Level: {sk.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Official Assessment Results */}
                <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Award className="h-4 w-4 text-emerald-500" />
                      <span>Assessment Verification ({passportData?.assessmentResults?.length || 0})</span>
                    </h3>
                  </div>

                  {(!passportData?.assessmentResults || passportData.assessmentResults.length === 0) ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1.5">
                      <p className="font-bold text-slate-700 dark:text-slate-300">No Assessment Results Recorded</p>
                      <p className="text-[11px] text-slate-400">Take skill assessments in the Skills module to earn verified badges on your Skill Passport.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {passportData.assessmentResults.map(ar => (
                        <div key={ar._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900 dark:text-white block">{ar.skill}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Correct: {ar.correctAnswers} / {ar.totalQuestions} • Earned: {ar.skillLevel}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {ar.scorePercentage}% Score
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Verified Projects */}
                <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <FolderGit2 className="h-4 w-4 text-indigo-500" />
                      <span>Projects Portfolio ({passportData?.projects?.length || projectsList.length})</span>
                    </h3>
                  </div>

                  {(passportData?.projects || projectsList).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No projects added yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {(passportData?.projects || projectsList).map(proj => (
                        <div key={proj._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-slate-900 dark:text-white">{proj.title}</h4>
                            <div className="flex items-center space-x-2">
                              {proj.githubUrl && (
                                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                  <GithubIcon className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {(proj.liveUrl || proj.link) && (
                                <a href={proj.liveUrl || proj.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {(proj.technologies || []).map((t, i) => (
                              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Verified Certifications */}
                <div className="p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Certifications & Credentials ({passportData?.certifications?.length || certificationsList.length})</span>
                    </h3>
                  </div>

                  {(passportData?.certifications || certificationsList).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No certifications registered yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {(passportData?.certifications || certificationsList).map(c => (
                        <div key={c._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                          <div className="flex justify-between items-start">
                            <h4 className="font-extrabold text-slate-900 dark:text-white">{c.title}</h4>
                            {c.credentialUrl && (
                              <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 text-[10px] font-bold flex items-center space-x-0.5">
                                <span>Verify</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{c.issuer} {c.issueDate ? `• Issued: ${c.issueDate}` : ''}</p>
                          {c.credentialId && (
                            <p className="text-[10px] font-mono text-slate-400">ID: {c.credentialId}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* ── PASSPORT FOOTER VERIFICATION SEAL ── */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center space-x-2 font-mono">
                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Zenith Institution Authenticated • Immutable Skill Verification</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Last Updated: {passportData?.issueDate ? new Date(passportData.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 2: PROJECTS ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <FolderGit2 className="h-5 w-5 text-indigo-500" />
                <span>Student Projects</span>
              </h2>
              <p className="text-xs text-slate-500">Showcase your technical projects, repositories, and live demos in MongoDB.</p>
            </div>

            <button
              onClick={openAddProject}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          </div>

          {projectsList.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <FolderGit2 className="h-10 w-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No projects added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your major technical projects, GitHub repositories, and live demo links to impress recruiters.
                </p>
              </div>
              <button
                onClick={openAddProject}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition"
              >
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projectsList.map((p) => (
                <div
                  key={p._id}
                  className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                        <FolderGit2 className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {p.duration || 'Semester Project'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">{p.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed pt-1">{p.description}</p>
                    </div>

                    {/* Technologies Tags */}
                    {p.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.technologies.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-bold font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Links */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold flex items-center space-x-1">
                          <GithubIcon className="h-3.5 w-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditProject(p)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                        title="Edit Project"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 3: CERTIFICATIONS ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'certifications' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>Certifications & Credentials</span>
              </h2>
              <p className="text-xs text-slate-500">Verified licenses, credentials, and course completions saved in MongoDB.</p>
            </div>

            <button
              onClick={openAddCert}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Certificate</span>
            </button>
          </div>

          {certificationsList.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <Award className="h-10 w-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No certifications added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add verified badges, AWS/Google certificates, or course completions to boost your placement match score.
                </p>
              </div>
              <button
                onClick={openAddCert}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs transition"
              >
                Add Certificate
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {certificationsList.map((c) => (
                <div
                  key={c._id}
                  className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Award className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Verified
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">{c.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">{c.issuer}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs space-y-1 font-mono">
                      {c.credentialId && (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>ID:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{c.credentialId}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Issued:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.issueDate || 'Verified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    {c.credentialUrl ? (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1 hover:underline">
                        <span>Verify Credential</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span />}

                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEditCert(c)} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Edit Certificate">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteCert(c._id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Delete Certificate">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 4: RESUME ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'resume' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <FileText className="h-5 w-5 text-red-500" />
                <span>Student PDF Resume</span>
              </h2>
              <p className="text-xs text-slate-500">Upload and inspect your official career resume stored in MongoDB file storage.</p>
            </div>

            <button
              onClick={() => resumeInputRef.current?.click()}
              disabled={uploadingResume}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              <span>{uploadingResume ? 'Uploading...' : resumeData?.resumeUrl ? 'Replace Resume' : 'Upload PDF'}</span>
            </button>
          </div>

          {resumeData?.resumeUrl ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white break-all">{resumeData.resumeName || 'Student_Resume.pdf'}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Uploaded: {resumeData.resumeUploadDate || 'Recently'} • {resumeData.resumeSize || 'Standard PDF'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={resumeData.resumeUrl}
                    download={resumeData.resumeName || 'Resume.pdf'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={handleDeleteResume}
                    disabled={deletingResume}
                    className="px-3.5 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl text-xs font-bold transition hover:bg-rose-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline PDF Viewer Frame */}
              <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                <iframe
                  src={`${resumeData.resumeUrl}#toolbar=1`}
                  title="Resume Viewer"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : (
            <div
              onClick={() => resumeInputRef.current?.click()}
              className="glass-card p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-red-400 text-center space-y-4 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No PDF resume uploaded yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click here to upload your official PDF resume (Max 10MB) to attach to company applications.
                </p>
              </div>
              <button
                type="button"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs transition"
              >
                Select PDF File
              </button>
            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ TAB 5: SOCIAL LINKS ━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'social' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span>Public & Social Profiles</span>
                </h3>
                <p className="text-xs text-slate-500">Connect your GitHub, LinkedIn, and personal portfolio.</p>
              </div>
              <button onClick={openEditModal} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20">
                Edit Links
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <GithubIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider block">GitHub Profile</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{profile?.socialLinks?.github || 'Not linked'}</span>
                  </div>
                </div>
                {profile?.socialLinks?.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 hover:underline">
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                    <LinkedinIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider block">LinkedIn Profile</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{profile?.socialLinks?.linkedin || 'Not linked'}</span>
                  </div>
                </div>
                {profile?.socialLinks?.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold flex items-center space-x-1 hover:underline">
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider block">Portfolio Website</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{profile?.socialLinks?.portfolio || 'Not linked'}</span>
                  </div>
                </div>
                {profile?.socialLinks?.portfolio && (
                  <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold flex items-center space-x-1 hover:underline">
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ EDIT PROFILE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Edit Student Profile</h3>
                  <p className="text-xs text-slate-500">Save changes directly to MongoDB.</p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">CGPA (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.75"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 dark:text-slate-200">College / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Zenith Institute of Technology"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Department</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Course / Degree</label>
                  <input
                    type="text"
                    placeholder="B.Tech"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 dark:text-slate-200">Current Year</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="3rd"
                    className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 dark:text-slate-200">Bio</label>
                <textarea
                  rows={2}
                  placeholder="Tell companies and recruiters about your passions and strengths..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white shadow-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase font-mono block text-[11px]">Social & Portfolio URLs</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="url"
                    placeholder="GitHub Profile URL"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-medium shadow-xs"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn Profile URL"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-medium shadow-xs"
                  />
                  <input
                    type="url"
                    placeholder="Portfolio URL"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-50/90 focus:bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-medium shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ ADD/EDIT PROJECT MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black">{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setProjectModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. AI-Powered Skill Gap Analyzer"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={projectForm.technologiesInput}
                  onChange={(e) => setProjectForm({ ...projectForm, technologiesInput: e.target.value })}
                  placeholder="React, Node.js, MongoDB, TailwindCSS"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Duration / Timeline</label>
                <input
                  type="text"
                  value={projectForm.duration}
                  onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
                  placeholder="e.g. Jan 2026 - Mar 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    placeholder="https://demo.app"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Project Description *</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Explain the project objective, key features, and architecture..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setProjectModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={savingProject} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md">
                  {savingProject ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━ ADD/EDIT CERTIFICATE MODAL ━━━━━━━━━━━━━━━━━━━━ */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black">{editingCertId ? 'Edit Certificate' : 'Add Certificate'}</h3>
              <button onClick={() => setCertModalOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Certificate Name *</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services, Google Cloud, Coursera"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold">Issue Date</label>
                  <input
                    type="date"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Credential ID</label>
                  <input
                    type="text"
                    value={certForm.credentialId}
                    onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                    placeholder="e.g. AWS-9482718"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Credential Verification URL</label>
                <input
                  type="url"
                  value={certForm.credentialUrl}
                  onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setCertModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={savingCert} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md">
                  {savingCert ? 'Saving...' : 'Save Certificate'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
