import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';


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





