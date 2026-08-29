import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import AssessmentResult from '../models/AssessmentResult.js';
import { matchSkills, analyzeSkillGap } from '../utils/matchingEngine.js';


/**
 * GET /api/students/profile
 * Returns the current authenticated student's profile populated with User data
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role avatarUrl emailVerified');

    // If profile document does not exist yet, auto-create one
    if (!profile) {
      profile = await StudentProfile.create({
        userId,
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science & Engineering',
          course: 'B.Tech Computer Science',
          degree: 'B.Tech',
          branch: 'Computer Science',
          year: '3rd Year (2026)',
          cgpa: 8.75
        },
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python', 'Tailwind CSS', 'Git'],
        projects: [
          {
            title: 'SkillNexus AI — Career & Skill Engine',
            description: 'Fullstack career ecosystem matching student skill DNA with industry demand and live opportunities.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
            link: 'https://github.com/team-zenith/skillnexus'
          }
        ],
        certifications: [
          {
            title: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2025',
            credentialUrl: 'https://aws.amazon.com'
          }
        ],
        socialLinks: {
          github: 'https://github.com/alexchen',
          linkedin: 'https://linkedin.com/in/alexchen',
          portfolio: 'https://alexchen.dev'
        },
        resumeUrl: 'https://drive.google.com'
      });

      profile = await StudentProfile.findById(profile._id).populate('userId', 'name email role avatarUrl emailVerified');
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get Student Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving student profile' });
  }
};


/**
 * PUT /api/students/profile
 * Validates and updates the student's profile fields in MongoDB
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      name,
      phone,
      dateOfBirth,
      profilePhoto,
      bio,
      academicInformation,
      skills,
      softSkills,
      projects,
      certifications,
      resumeUrl,
      socialLinks,
      achievements
    } = req.body;

    // ── 1. FIELD VALIDATION ──
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full Name cannot be empty.' });
      }
      if (name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Full Name must be at least 2 characters.' });
      }
    }

    if (phone !== undefined && phone.trim() !== '') {
      const cleanPhone = phone.trim().replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid phone number (7-15 digits).' });
      }
    }

    if (dateOfBirth !== undefined && dateOfBirth.trim() !== '') {
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid Date of Birth format.' });
      }
      if (dobDate > new Date()) {
        return res.status(400).json({ success: false, message: 'Date of Birth cannot be in the future.' });
      }
    }

    if (academicInformation) {
      const { college, department, course, year, cgpa } = academicInformation;

      if (college !== undefined && !college.trim()) {
        return res.status(400).json({ success: false, message: 'College / Institution name is required.' });
      }
      if (department !== undefined && !department.trim()) {
        return res.status(400).json({ success: false, message: 'Department is required.' });
      }
      if (course !== undefined && !course.trim()) {
        return res.status(400).json({ success: false, message: 'Course is required.' });
      }
      if (year !== undefined && !year.toString().trim()) {
        return res.status(400).json({ success: false, message: 'Academic Year is required.' });
      }

      if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
        const numCgpa = parseFloat(cgpa);
        if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
          return res.status(400).json({ success: false, message: 'CGPA must be a valid number between 0.0 and 10.0.' });
        }
      }
    }

    // ── 2. UPDATE USER MODEL ──
    if (name && name.trim()) {
      await User.findByIdAndUpdate(userId, { name: name.trim() });
    }

    // ── 3. UPDATE OR INITIALIZE STUDENT PROFILE ──
    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    // Personal Information
    if (phone !== undefined) profile.phone = phone.trim();
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth.trim();
    if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto.trim();
    if (bio !== undefined) profile.bio = bio.trim();

    // Academic Information
    if (academicInformation) {
      const a = academicInformation;
      const prev = profile.academicInformation || {};
      profile.academicInformation = {
        college: a.college !== undefined ? a.college.trim() : (prev.college || ''),
        department: a.department !== undefined ? a.department.trim() : (prev.department || ''),
        course: a.course !== undefined ? a.course.trim() : (prev.course || ''),
        degree: a.course !== undefined ? a.course.trim() : (prev.degree || ''),
        branch: a.department !== undefined ? a.department.trim() : (prev.branch || ''),
        year: a.year !== undefined ? a.year.toString().trim() : (prev.year || ''),
        cgpa: a.cgpa !== undefined && a.cgpa !== null && a.cgpa !== '' ? parseFloat(a.cgpa) : prev.cgpa
      };
    }

    // Skills
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) 
        ? skills.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean)
        : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : profile.skills);
    }

    if (softSkills !== undefined) {
      profile.softSkills = Array.isArray(softSkills)
        ? softSkills.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean)
        : (typeof softSkills === 'string' ? softSkills.split(',').map(s => s.trim()).filter(Boolean) : profile.softSkills);
    }

    // Projects
    if (projects !== undefined && Array.isArray(projects)) {
      profile.projects = projects.map(p => ({
        title: (p.title || '').trim(),
        description: (p.description || '').trim(),
        technologies: Array.isArray(p.technologies) 
          ? p.technologies.map(t => t.trim()).filter(Boolean)
          : (typeof p.technologies === 'string' ? p.technologies.split(',').map(t => t.trim()).filter(Boolean) : []),
        link: (p.link || '').trim()
      }));
    }

    // Certifications
    if (certifications !== undefined && Array.isArray(certifications)) {
      profile.certifications = certifications.map(c => ({
        title: (c.title || '').trim(),
        issuer: (c.issuer || '').trim(),
        date: (c.date || '').trim(),
        credentialUrl: (c.credentialUrl || '').trim()
      }));
    }

    // Resume
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl.trim();

    // Social Links
    if (socialLinks !== undefined) {
      profile.socialLinks = {
        github: (socialLinks.github || '').trim(),
        linkedin: (socialLinks.linkedin || '').trim(),
        portfolio: (socialLinks.portfolio || '').trim()
      };
    }

    if (achievements !== undefined) {
      profile.achievements = Array.isArray(achievements) ? achievements : profile.achievements;
    }

    await profile.save();

    // Re-fetch populated profile from MongoDB
    const updatedProfile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role avatarUrl emailVerified');

    res.status(200).json({
      success: true,
      message: 'Student profile updated and saved to MongoDB successfully!',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update Student Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating student profile: ' + error.message });
  }
};


/**
 * POST /api/students/upload-photo
 * Handles multipart profile photo upload, saves to disk, updates MongoDB User & Profile
 */
export const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    // Relative web URL to access the uploaded image
    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // 1. Update User model avatarUrl
    await User.findByIdAndUpdate(userId, { avatarUrl: photoUrl });

    // 2. Update StudentProfile model profilePhoto
    let profile = await StudentProfile.findOne({ userId });
    if (profile) {
      profile.profilePhoto = photoUrl;
      await profile.save();
    } else {
      profile = await StudentProfile.create({
        userId,
        profilePhoto: photoUrl
      });
    }

    const updatedProfile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role avatarUrl emailVerified');

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded and saved successfully!',
      photoUrl,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Upload Photo Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo: ' + error.message
    });
  }
};


const VALID_PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];


/**
 * GET /api/students/skills
 * Returns the student's list of skills from MongoDB
 */
export const getSkills = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    // Auto-migrate legacy skills array if skillsList is empty
    if ((!profile.skillsList || profile.skillsList.length === 0) && profile.skills && profile.skills.length > 0) {
      profile.skillsList = profile.skills.map(sk => ({
        name: sk,
        category: 'Technical',
        proficiency: 'Intermediate'
      }));
      await profile.save();
    }

    res.status(200).json({
      success: true,
      skills: profile.skillsList || []
    });
  } catch (error) {
    console.error('Get Skills Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving skills: ' + error.message });
  }
};


/**
 * POST /api/students/skills
 * Adds a new skill to student profile in MongoDB
 */
export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, category, proficiency } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Skill category is required.' });
    }

    const cleanProficiency = (proficiency || 'Intermediate').trim();
    if (!VALID_PROFICIENCY_LEVELS.includes(cleanProficiency)) {
      return res.status(400).json({
        success: false,
        message: `Proficiency must be one of: ${VALID_PROFICIENCY_LEVELS.join(', ')}`
      });
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    // Check duplicate
    const cleanName = name.trim();
    const existing = profile.skillsList?.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Skill '${cleanName}' is already in your skills profile.`
      });
    }

    const newSkill = {
      name: cleanName,
      category: category.trim(),
      proficiency: cleanProficiency
    };

    profile.skillsList.push(newSkill);
    if (!profile.skills.includes(cleanName)) {
      profile.skills.push(cleanName);
    }

    await profile.save();

    res.status(201).json({
      success: true,
      message: `Skill '${cleanName}' added successfully!`,
      skill: profile.skillsList[profile.skillsList.length - 1],
      skills: profile.skillsList
    });
  } catch (error) {
    console.error('Add Skill Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding skill: ' + error.message });
  }
};


/**
 * PUT /api/students/skills/:skillId
 * Updates an existing skill in MongoDB
 */
export const editSkill = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { skillId } = req.params;
    const { name, category, proficiency } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Skill category is required.' });
    }

    const cleanProficiency = (proficiency || 'Intermediate').trim();
    if (!VALID_PROFICIENCY_LEVELS.includes(cleanProficiency)) {
      return res.status(400).json({
        success: false,
        message: `Proficiency must be one of: ${VALID_PROFICIENCY_LEVELS.join(', ')}`
      });
    }

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const skillItem = profile.skillsList.id(skillId);
    if (!skillItem) {
      return res.status(404).json({ success: false, message: 'Skill not found in profile.' });
    }

    const oldName = skillItem.name;
    const cleanName = name.trim();

    // Check duplicate with another item
    const duplicate = profile.skillsList.find(s => s._id.toString() !== skillId && s.name.toLowerCase() === cleanName.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Another skill with name '${cleanName}' already exists.` });
    }

    skillItem.name = cleanName;
    skillItem.category = category.trim();
    skillItem.proficiency = cleanProficiency;

    // Synchronize flat skills array
    profile.skills = profile.skills.map(s => s === oldName ? cleanName : s);

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Skill '${cleanName}' updated successfully!`,
      skill: skillItem,
      skills: profile.skillsList
    });
  } catch (error) {
    console.error('Edit Skill Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error editing skill: ' + error.message });
  }
};


/**
 * DELETE /api/students/skills/:skillId
 * Deletes a skill from student profile in MongoDB
 */
export const deleteSkill = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { skillId } = req.params;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const skillItem = profile.skillsList.id(skillId);
    if (!skillItem) {
      return res.status(404).json({ success: false, message: 'Skill not found in profile.' });
    }

    const removedName = skillItem.name;
    profile.skillsList.pull({ _id: skillId });
    profile.skills = profile.skills.filter(s => s !== removedName);

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Skill '${removedName}' deleted successfully!`,
      skills: profile.skillsList
    });
  } catch (error) {
    console.error('Delete Skill Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting skill: ' + error.message });
  }
};


/**
 * GET /api/students/projects
 * Returns all portfolio projects for the student from MongoDB
 */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    res.status(200).json({
      success: true,
      projects: profile.projects || []
    });
  } catch (error) {
    console.error('Get Projects Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving projects: ' + error.message });
  }
};


/**
 * POST /api/students/projects
 * Adds a new portfolio project to student profile in MongoDB
 */
export const addProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, description, technologies, githubUrl, liveUrl, link, duration } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Project description is required.' });
    }

    let parsedTech = [];
    if (Array.isArray(technologies)) {
      parsedTech = technologies.map(t => t.trim()).filter(Boolean);
    } else if (typeof technologies === 'string' && technologies.trim()) {
      parsedTech = technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    const newProject = {
      title: title.trim(),
      description: description.trim(),
      technologies: parsedTech,
      githubUrl: (githubUrl || '').trim(),
      liveUrl: (liveUrl || '').trim(),
      link: (link || liveUrl || githubUrl || '').trim(),
      duration: (duration || '').trim()
    };

    profile.projects.push(newProject);
    await profile.save();

    res.status(201).json({
      success: true,
      message: `Project '${newProject.title}' added successfully!`,
      project: profile.projects[profile.projects.length - 1],
      projects: profile.projects
    });
  } catch (error) {
    console.error('Add Project Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding project: ' + error.message });
  }
};


/**
 * PUT /api/students/projects/:projectId
 * Updates an existing portfolio project in MongoDB
 */
export const editProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { projectId } = req.params;
    const { title, description, technologies, githubUrl, liveUrl, link, duration } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Project description is required.' });
    }

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const projectItem = profile.projects.id(projectId);
    if (!projectItem) {
      return res.status(404).json({ success: false, message: 'Project not found in profile.' });
    }

    let parsedTech = projectItem.technologies;
    if (Array.isArray(technologies)) {
      parsedTech = technologies.map(t => t.trim()).filter(Boolean);
    } else if (typeof technologies === 'string' && technologies.trim()) {
      parsedTech = technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    projectItem.title = title.trim();
    projectItem.description = description.trim();
    projectItem.technologies = parsedTech;
    projectItem.githubUrl = githubUrl !== undefined ? githubUrl.trim() : projectItem.githubUrl;
    projectItem.liveUrl = liveUrl !== undefined ? liveUrl.trim() : projectItem.liveUrl;
    projectItem.link = link !== undefined ? link.trim() : (projectItem.liveUrl || projectItem.githubUrl);
    projectItem.duration = duration !== undefined ? duration.trim() : projectItem.duration;

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Project '${projectItem.title}' updated successfully!`,
      project: projectItem,
      projects: profile.projects
    });
  } catch (error) {
    console.error('Edit Project Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error editing project: ' + error.message });
  }
};


/**
 * DELETE /api/students/projects/:projectId
 * Deletes a portfolio project from MongoDB
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { projectId } = req.params;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const projectItem = profile.projects.id(projectId);
    if (!projectItem) {
      return res.status(404).json({ success: false, message: 'Project not found in profile.' });
    }

    const removedTitle = projectItem.title;
    profile.projects.pull({ _id: projectId });
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Project '${removedTitle}' deleted successfully!`,
      projects: profile.projects
    });
  } catch (error) {
    console.error('Delete Project Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting project: ' + error.message });
  }
};


/**
 * GET /api/students/certifications
 * Returns all verified certifications for the student from MongoDB
 */
export const getCertifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    res.status(200).json({
      success: true,
      certifications: profile.certifications || []
    });
  } catch (error) {
    console.error('Get Certifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving certifications: ' + error.message });
  }
};


/**
 * POST /api/students/certifications
 * Adds a new certification to student profile in MongoDB
 */
export const addCertification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { title, name, issuer, organization, issueDate, date, credentialId, credentialUrl } = req.body;

    const certTitle = (title || name || '').trim();
    const certIssuer = (issuer || organization || '').trim();
    const certDate = (issueDate || date || '').trim();

    if (!certTitle) {
      return res.status(400).json({ success: false, message: 'Certificate Name is required.' });
    }

    if (!certIssuer) {
      return res.status(400).json({ success: false, message: 'Issuing Organization is required.' });
    }

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    const newCert = {
      title: certTitle,
      issuer: certIssuer,
      issueDate: certDate,
      date: certDate,
      credentialId: (credentialId || '').trim(),
      credentialUrl: (credentialUrl || '').trim()
    };

    profile.certifications.push(newCert);
    await profile.save();

    res.status(201).json({
      success: true,
      message: `Certificate '${newCert.title}' added successfully!`,
      certification: profile.certifications[profile.certifications.length - 1],
      certifications: profile.certifications
    });
  } catch (error) {
    console.error('Add Certification Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding certification: ' + error.message });
  }
};


/**
 * PUT /api/students/certifications/:certId
 * Updates an existing certification in MongoDB
 */
export const editCertification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { certId } = req.params;
    const { title, name, issuer, organization, issueDate, date, credentialId, credentialUrl } = req.body;

    const certTitle = (title || name || '').trim();
    const certIssuer = (issuer || organization || '').trim();
    const certDate = (issueDate || date || '').trim();

    if (!certTitle) {
      return res.status(400).json({ success: false, message: 'Certificate Name is required.' });
    }

    if (!certIssuer) {
      return res.status(400).json({ success: false, message: 'Issuing Organization is required.' });
    }

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const certItem = profile.certifications.id(certId);
    if (!certItem) {
      return res.status(404).json({ success: false, message: 'Certification not found in profile.' });
    }

    certItem.title = certTitle;
    certItem.issuer = certIssuer;
    certItem.issueDate = certDate;
    certItem.date = certDate;
    certItem.credentialId = credentialId !== undefined ? credentialId.trim() : certItem.credentialId;
    certItem.credentialUrl = credentialUrl !== undefined ? credentialUrl.trim() : certItem.credentialUrl;

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Certificate '${certItem.title}' updated successfully!`,
      certification: certItem,
      certifications: profile.certifications
    });
  } catch (error) {
    console.error('Edit Certification Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error editing certification: ' + error.message });
  }
};


/**
 * DELETE /api/students/certifications/:certId
 * Deletes a certification from student profile in MongoDB
 */
export const deleteCertification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { certId } = req.params;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const certItem = profile.certifications.id(certId);
    if (!certItem) {
      return res.status(404).json({ success: false, message: 'Certification not found in profile.' });
    }

    const removedTitle = certItem.title;
    profile.certifications.pull({ _id: certId });
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Certificate '${removedTitle}' deleted successfully!`,
      certifications: profile.certifications
    });
  } catch (error) {
    console.error('Delete Certification Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting certification: ' + error.message });
  }
};


/**
 * GET /api/students/resume
 * Retrieves resume metadata for authenticated student from MongoDB
 */
export const getResume = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    res.status(200).json({
      success: true,
      resume: {
        resumeUrl: profile.resumeUrl || '',
        resumeName: profile.resumeName || (profile.resumeUrl ? 'Student_Resume.pdf' : ''),
        resumeUploadDate: profile.resumeUploadDate || '',
        resumeSize: profile.resumeSize || ''
      }
    });
  } catch (error) {
    console.error('Get Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving resume: ' + error.message });
  }
};


/**
 * POST /api/students/upload-resume
 * Uploads a PDF resume, saves to disk, updates MongoDB StudentProfile
 */
export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid PDF file to upload.'
      });
    }

    // Relative served URL
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeName = req.file.originalname || 'Resume.pdf';
    const resumeUploadDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const sizeInKb = (req.file.size / 1024).toFixed(1);
    const resumeSize = req.file.size > 1024 * 1024 
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${sizeInKb} KB`;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = new StudentProfile({ userId });
    }

    profile.resumeUrl = resumeUrl;
    profile.resumeName = resumeName;
    profile.resumeUploadDate = resumeUploadDate;
    profile.resumeSize = resumeSize;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume PDF uploaded and saved successfully to MongoDB!',
      resume: {
        resumeUrl,
        resumeName,
        resumeUploadDate,
        resumeSize
      }
    });
  } catch (error) {
    console.error('Upload Resume Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume: ' + error.message
    });
  }
};


/**
 * DELETE /api/students/resume
 * Deletes resume from student profile in MongoDB
 */
export const deleteResume = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    profile.resumeUrl = '';
    profile.resumeName = '';
    profile.resumeUploadDate = '';
    profile.resumeSize = '';

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully from MongoDB.'
    });
  } catch (error) {
    console.error('Delete Resume Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting resume: ' + error.message });
  }
};


/**
 * POST /api/students/skill-gap
 * GET /api/students/skill-gap
 * Evaluates student skill gap against a specified opportunity, role, or required skills
 */
export const getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    // Format current student skills with structured categories and proficiencies
    const currentSkills = (profile.skillsList && profile.skillsList.length > 0)
      ? profile.skillsList.map(s => ({
          name: s.name,
          category: s.category || 'Technical',
          proficiency: s.proficiency || s.proficiencyLevel || 'Intermediate'
        }))
      : (profile.skills || []).map(s => ({
          name: s,
          category: 'Technical',
          proficiency: 'Intermediate'
        }));

    // Fetch active opportunities from MongoDB for real target options
    const opportunities = await Opportunity.find({ status: 'open' })
      .populate('companyId', 'companyName industry location logo')
      .sort({ createdAt: -1 });

    const opportunityId = req.query.opportunityId || req.body.opportunityId;
    const customSkills = req.query.requiredSkills || req.body.requiredSkills;
    const roleId = req.query.roleId || req.body.roleId;

    let targetSkills = [];
    let selectedOpportunity = null;

    if (opportunityId && opportunityId !== 'none') {
      const opp = await Opportunity.findById(opportunityId).populate('companyId', 'companyName industry location logo');
      if (opp) {
        targetSkills = opp.requiredSkills || [];
        selectedOpportunity = {
          _id: opp._id,
          title: opp.title,
          type: opp.type,
          companyName: opp.companyId?.companyName || 'Corporate Partner',
          industry: opp.companyId?.industry || 'Technology',
          location: opp.location || 'Remote',
          stipend: opp.stipend || 'Competitive',
          requiredSkills: opp.requiredSkills || []
        };
      }
    } else if (Array.isArray(customSkills) && customSkills.length > 0) {
      targetSkills = customSkills;
    } else if (typeof customSkills === 'string' && customSkills.trim()) {
      targetSkills = customSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    // If an opportunity or target role is selected, compute exact matching
    let matchData = null;
    let weakSkills = [];
    let recommendedSkills = [];

    if (targetSkills.length > 0) {
      matchData = matchSkills(profile, targetSkills);

      // Find weak skills (skills student has that are at Beginner proficiency and in required skills)
      const targetLookup = new Set(targetSkills.map(s => s.toLowerCase().trim()));
      weakSkills = currentSkills.filter(s => 
        s.proficiency.toLowerCase() === 'beginner' && targetLookup.has(s.name.toLowerCase().trim())
      );

      // Aggregate high-demand skills from active opportunities in MongoDB to construct recommended roadmap
      const skillFrequency = {};
      opportunities.forEach(opp => {
        (opp.requiredSkills || []).forEach(sk => {
          const norm = sk.trim();
          skillFrequency[norm] = (skillFrequency[norm] || 0) + 1;
        });
      });

      // Combine missing skills from target role with high-demand marketplace skills
      const studentSkillSet = new Set(currentSkills.map(s => s.name.toLowerCase().trim()));
      const recommendedSet = new Set();
      recommendedSkills = [];

      // 1. Prioritize missing skills for target role
      matchData.missingSkills.forEach(sk => {
        if (!recommendedSet.has(sk.toLowerCase())) {
          recommendedSet.add(sk.toLowerCase());
          recommendedSkills.push({
            skill: sk,
            reason: 'Required for selected target opening',
            priority: 'High',
            marketDemandCount: skillFrequency[sk] || 1
          });
        }
      });

      // 2. Add top in-demand skills from database not currently in student profile
      Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .forEach(([sk, count]) => {
          if (!studentSkillSet.has(sk.toLowerCase()) && !recommendedSet.has(sk.toLowerCase()) && recommendedSkills.length < 8) {
            recommendedSet.add(sk.toLowerCase());
            recommendedSkills.push({
              skill: sk,
              reason: 'High marketplace employer demand',
              priority: 'Medium',
              marketDemandCount: count
            });
          }
        });
    }

    res.status(200).json({
      success: true,
      hasTargetSelected: targetSkills.length > 0,
      currentSkills,
      matchPercentage: matchData ? matchData.matchPercentage : null,
      matchedSkills: matchData ? matchData.matchedSkills : [],
      missingSkills: matchData ? matchData.missingSkills : [],
      weakSkills,
      recommendedSkills,
      selectedOpportunity,
      targetSkills,
      opportunities: opportunities.map(o => ({
        _id: o._id,
        title: o.title,
        type: o.type,
        companyName: o.companyId?.companyName || 'Corporate Partner',
        industry: o.companyId?.industry || 'Technology',
        location: o.location || 'Remote',
        requiredSkills: o.requiredSkills || []
      }))
    });
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error computing skill gap analysis: ' + error.message
    });
  }
};

/**
 * GET /api/students/notifications
 * Retrieves live event notifications for the logged-in student
 */
export const getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    const student = await StudentProfile.findOne({ userId });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration requiredSkills',
        populate: { path: 'companyId', select: 'companyName industry location logo' }
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const readIds = new Set(user?.readNotifications || []);
    const notifications = [];

    applications.forEach(app => {
      const opp = app.opportunityId || {};
      const companyName = opp.companyId?.companyName || 'Employer';
      const roleTitle = opp.title || 'Position';
      const status = (app.status || 'applied').toLowerCase();

      // 1. Application Submitted Event
      const subId = `app_submitted_${app._id}`;
      notifications.push({
        id: subId,
        type: 'application_submitted',
        title: 'Application Submitted',
        message: `Your application for "${roleTitle}" at ${companyName} was submitted successfully.`,
        timestamp: app.createdAt,
        read: readIds.has(subId),
        link: '/applications'
      });

      // 2. Application Reviewed Event
      if (['reviewed', 'shortlisted', 'interview', 'selected', 'accepted'].includes(status)) {
        const revId = `app_reviewed_${app._id}`;
        notifications.push({
          id: revId,
          type: 'application_reviewed',
          title: 'Application Under Review',
          message: `${companyName} recruitment team is reviewing your application for "${roleTitle}".`,
          timestamp: app.updatedAt || app.createdAt,
          read: readIds.has(revId),
          link: '/applications'
        });
      }

      // 3. Student Shortlisted Event
      if (['shortlisted', 'interview', 'selected', 'accepted'].includes(status)) {
        const shortId = `app_shortlisted_${app._id}`;
        notifications.push({
          id: shortId,
          type: 'student_shortlisted',
          title: 'Candidate Shortlisted 🎉',
          message: `Congratulations! You have been shortlisted by ${companyName} for "${roleTitle}".`,
          timestamp: app.updatedAt || app.createdAt,
          read: readIds.has(shortId),
          link: '/applications'
        });
      }

      // 4. Application Rejected Event
      if (status === 'rejected') {
        const rejId = `app_rejected_${app._id}`;
        notifications.push({
          id: rejId,
          type: 'application_rejected',
          title: 'Application Status Update',
          message: `Your application for "${roleTitle}" at ${companyName} has not been selected for the next round.`,
          timestamp: app.updatedAt || app.createdAt,
          read: readIds.has(rejId),
          link: '/applications'
        });
      }

      // 5. Interview Scheduled / Cancelled Event
      if (app.interviewDetails && (app.interviewDetails.scheduledAt || status === 'interview')) {
        const isCancelled = (app.interviewDetails.status || '').toLowerCase() === 'cancelled';
        const intId = isCancelled ? `interview_cancelled_${app._id}` : `interview_sched_${app._id}`;
        const formattedDate = app.interviewDetails.scheduledAt 
          ? new Date(app.interviewDetails.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Upcoming';

        notifications.push({
          id: intId,
          type: isCancelled ? 'interview_cancelled' : 'interview_scheduled',
          title: isCancelled ? 'Interview Cancelled' : 'Interview Scheduled 📅',
          message: isCancelled
            ? `Your interview with ${companyName} for "${roleTitle}" has been cancelled.`
            : `Technical Interview scheduled with ${companyName} on ${formattedDate} (${app.interviewDetails.mode || 'video'}). Check details to join.`,
          timestamp: app.interviewDetails.scheduledAt || app.updatedAt,
          read: readIds.has(intId),
          link: '/applications',
          meetingLink: app.interviewDetails.meetingLink || ''
        });
      }

      // 6. Student Selected Event
      if (['selected', 'accepted'].includes(status)) {
        const selId = `student_selected_${app._id}`;
        notifications.push({
          id: selId,
          type: 'student_selected',
          title: 'Offer Extended / Selected 🎉',
          message: `Congratulations! ${companyName} has selected you for "${roleTitle}".`,
          timestamp: app.updatedAt,
          read: readIds.has(selId),
          link: '/applications'
        });
      }

      // 7. Placement Completed Event
      if (app.placementDetails?.isPlaced || status === 'selected' || status === 'accepted') {
        const placeId = `placement_done_${app._id}`;
        const pkg = app.placementDetails?.package || opp.stipend || 'Competitive Package';
        notifications.push({
          id: placeId,
          type: 'placement_completed',
          title: 'Placement Confirmed 🎓',
          message: `Official placement confirmed with ${companyName} as ${opp.title} (${pkg}).`,
          timestamp: app.placementDetails?.placedAt || app.updatedAt,
          read: readIds.has(placeId),
          link: '/dashboard'
        });
      }
    });

    // Sort notifications chronologically (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Student Notifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications: ' + error.message });
  }
};

/**
 * PUT /api/students/notifications/:id/read
 */
export const markStudentNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (!user.readNotifications) user.readNotifications = [];
    if (!user.readNotifications.includes(id)) {
      user.readNotifications.push(id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      readNotifications: user.readNotifications
    });
  } catch (error) {
    console.error('Mark Student Notification Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

/**
 * PUT /api/students/notifications/read-all
 */
export const markAllStudentNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const existing = new Set(user.readNotifications || []);
      notificationIds.forEach(id => existing.add(id));
      user.readNotifications = Array.from(existing);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      readNotifications: user.readNotifications
    });
  } catch (error) {
    console.error('Mark All Student Notifications Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};

/**
 * GET /api/students/readiness-score
 * Computes transparent, explainable Career Readiness Score from actual student database data
 */
export const getCareerReadinessScore = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email avatarUrl');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const assessments = await AssessmentResult.find({ userId }).sort({ createdAt: -1 });
    const opportunities = await Opportunity.find({ status: 'open' });

    // ─────────────────────────────────────────────────────────────
    // 1. Skill Strength (Max 25 pts)
    // ─────────────────────────────────────────────────────────────
    const skillsList = (profile.skillsList && profile.skillsList.length > 0)
      ? profile.skillsList
      : (profile.skills || []).map(s => ({ name: s, proficiency: 'Intermediate' }));

    const totalSkillsCount = skillsList.length;
    let skillQuantityPts = Math.min(10, totalSkillsCount * 2); // 5 skills = 10 pts

    let advancedCount = 0;
    let intermediateCount = 0;
    let beginnerCount = 0;

    skillsList.forEach(s => {
      const p = (s.proficiency || 'Intermediate').toLowerCase();
      if (p === 'advanced' || p === 'expert') advancedCount++;
      else if (p === 'intermediate') intermediateCount++;
      else beginnerCount++;
    });

    let proficiencyPts = Math.min(15, (advancedCount * 4) + (intermediateCount * 2));
    const skillStrength = Math.min(25, skillQuantityPts + proficiencyPts);

    // ─────────────────────────────────────────────────────────────
    // 2. Assessment Strength (Max 20 pts)
    // ─────────────────────────────────────────────────────────────
    let assessmentStrength = 0;
    let assessmentAvg = 0;
    if (assessments.length > 0) {
      const totalScorePercent = assessments.reduce((sum, a) => sum + (a.percentage || a.scorePercentage || 0), 0);
      assessmentAvg = Math.round(totalScorePercent / assessments.length);
      assessmentStrength = Math.min(20, Math.round((assessmentAvg / 100) * 20));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Project Strength (Max 20 pts)
    // ─────────────────────────────────────────────────────────────
    const projects = profile.projects || [];
    let projectStrength = 0;
    projects.forEach(p => {
      let pPts = 5; // Base project description
      if (p.technologies && p.technologies.length > 0) pPts += 3;
      if (p.githubUrl || p.liveUrl || p.link) pPts += 2;
      projectStrength += pPts;
    });
    projectStrength = Math.min(20, projectStrength);

    // ─────────────────────────────────────────────────────────────
    // 4. Profile Completeness & Verified Resume (Max 15 pts)
    // ─────────────────────────────────────────────────────────────
    let completenessPts = 0;
    const hasResume = Boolean(profile.resumeUrl);
    if (hasResume) completenessPts += 10;
    if (profile.bio && profile.bio.trim().length > 10) completenessPts += 3;
    if (profile.phone || profile.socialLinks?.github || profile.socialLinks?.linkedin) completenessPts += 2;
    const profileCompletenessScore = Math.min(15, completenessPts);

    // ─────────────────────────────────────────────────────────────
    // 5. Academic Standing (Max 10 pts)
    // ─────────────────────────────────────────────────────────────
    let academicPts = 0;
    const cgpa = profile.academicInformation?.cgpa !== null && profile.academicInformation?.cgpa !== undefined
      ? Number(profile.academicInformation.cgpa)
      : null;

    if (cgpa !== null) {
      if (cgpa >= 8.5) academicPts = 10;
      else if (cgpa >= 7.5) academicPts = 8;
      else if (cgpa >= 6.5) academicPts = 6;
      else academicPts = 4;
    }
    const academicStrength = academicPts;

    // ─────────────────────────────────────────────────────────────
    // 6. Certifications (Max 10 pts)
    // ─────────────────────────────────────────────────────────────
    const certs = profile.certifications || [];
    const certificationStrength = Math.min(10, certs.length * 5);

    // ─────────────────────────────────────────────────────────────
    // TOTAL READINESS SCORE (0 - 100)
    // ─────────────────────────────────────────────────────────────
    const totalScore = Math.min(100, Math.round(
      skillStrength + assessmentStrength + projectStrength + profileCompletenessScore + academicStrength + certificationStrength
    ));

    // ─────────────────────────────────────────────────────────────
    // Explainability Engine: "Why is my score this?"
    // ─────────────────────────────────────────────────────────────
    const positiveFactors = [];
    const improvementAreas = [];
    const missingSections = [];

    // Skills evaluation
    if (totalSkillsCount >= 4) {
      positiveFactors.push(`${totalSkillsCount} verified skills recorded (+${skillQuantityPts} pts)`);
    } else {
      improvementAreas.push(`Add at least ${Math.max(1, 4 - totalSkillsCount)} more skills to boost competency (+${Math.max(2, (4 - totalSkillsCount) * 2)} pts)`);
    }

    if (advancedCount > 0) {
      positiveFactors.push(`${advancedCount} skill(s) evaluated at Advanced/Expert proficiency (+${advancedCount * 4} pts)`);
    } else if (beginnerCount > 0) {
      improvementAreas.push(`Upgrade ${beginnerCount} beginner-tier skills via practice assessments to gain up to +10 pts`);
    }

    // Assessment evaluation
    if (assessments.length > 0) {
      positiveFactors.push(`${assessments.length} verified assessment(s) passed with ${assessmentAvg}% average (+${assessmentStrength} pts)`);
    } else {
      missingSections.push('Skill Assessments');
      improvementAreas.push(`Take a verified skill assessment to unlock up to +20 points`);
    }

    // Projects evaluation
    if (projects.length >= 2) {
      positiveFactors.push(`${projects.length} technical projects documented with tech stacks (+${projectStrength} pts)`);
    } else if (projects.length === 1) {
      positiveFactors.push(`1 technical project added (+${projectStrength} pts)`);
      improvementAreas.push(`Add 1 more project with GitHub/Live URL to maximize Project Strength (+${20 - projectStrength} pts)`);
    } else {
      missingSections.push('Technical Projects');
      improvementAreas.push(`Add technical projects with repository or live demo links (+20 pts)`);
    }

    // Resume & Profile evaluation
    if (hasResume) {
      positiveFactors.push(`Verified PDF resume attached (+10 pts)`);
    } else {
      missingSections.push('Resume');
      improvementAreas.push(`Upload your verified resume in PDF format (+10 pts)`);
    }

    // Academic evaluation
    if (cgpa !== null) {
      positiveFactors.push(`Academic CGPA of ${cgpa} on record (+${academicStrength} pts)`);
    } else {
      missingSections.push('Academic Information');
      improvementAreas.push(`Complete academic details (CGPA, Branch, Year) (+10 pts)`);
    }

    // Certifications evaluation
    if (certs.length > 0) {
      positiveFactors.push(`${certs.length} verified certification(s) on file (+${certificationStrength} pts)`);
    } else {
      missingSections.push('Industry Certifications');
      improvementAreas.push(`Add industry or course certifications (+10 pts)`);
    }

    // Market Skill Gap Summary
    const skillDemandMap = {};
    opportunities.forEach(opp => {
      (opp.requiredSkills || []).forEach(sk => {
        const norm = sk.trim();
        skillDemandMap[norm] = (skillDemandMap[norm] || 0) + 1;
      });
    });

    const studentSkillLookup = new Set(skillsList.map(s => s.name.toLowerCase().trim()));
    const missingMarketSkills = Object.entries(skillDemandMap)
      .filter(([sk]) => !studentSkillLookup.has(sk.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sk, demand]) => ({ skill: sk, demandCount: demand }));

    // Placement Tier Classification
    let readinessTier = 'Developing Potential';
    let readinessColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (totalScore >= 80) {
      readinessTier = 'Interview Ready (Elite Tier)';
      readinessColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    } else if (totalScore >= 60) {
      readinessTier = 'Market Competitive';
      readinessColor = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    } else if (totalScore >= 40) {
      readinessTier = 'Emerging Candidate';
      readinessColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }

    res.status(200).json({
      success: true,
      score: totalScore,
      tier: readinessTier,
      tierColor: readinessColor,
      breakdown: {
        skillStrength: { score: skillStrength, max: 25, percentage: Math.round((skillStrength / 25) * 100) },
        assessmentStrength: { score: assessmentStrength, max: 20, percentage: Math.round((assessmentStrength / 20) * 100) },
        projectStrength: { score: projectStrength, max: 20, percentage: Math.round((projectStrength / 20) * 100) },
        profileCompleteness: { score: profileCompletenessScore, max: 15, percentage: Math.round((profileCompletenessScore / 15) * 100) },
        academicStanding: { score: academicStrength, max: 10, percentage: Math.round((academicStrength / 10) * 100) },
        certifications: { score: certificationStrength, max: 10, percentage: Math.round((certificationStrength / 10) * 100) }
      },
      explainability: {
        positiveFactors,
        improvementAreas,
        missingSections
      },
      skillGapSummary: {
        totalVerifiedSkills: totalSkillsCount,
        advancedSkills: advancedCount,
        topMarketDemandSkillsMissing: missingMarketSkills
      }
    });
  } catch (error) {
    console.error('Career Readiness Score Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error calculating career readiness score: ' + error.message });
  }
};





