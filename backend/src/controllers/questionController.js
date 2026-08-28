import Question from '../models/Question.js';
import AssessmentResult from '../models/AssessmentResult.js';
import StudentProfile from '../models/StudentProfile.js';
import { QUESTION_BANKS } from '../data/assessmentQuestions.js';

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

/**
 * POST /api/questions
 * [ADMIN ONLY] Create a new assessment question in MongoDB
 */
export const createQuestion = async (req, res) => {
  try {
    const { skill, question, options, correctAnswer, difficulty, explanation } = req.body;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }

    let parsedOptions = [];
    if (Array.isArray(options)) {
      parsedOptions = options.map(o => String(o).trim()).filter(Boolean);
    }

    if (parsedOptions.length < 2) {
      return res.status(400).json({ success: false, message: 'Question must have at least 2 non-empty options.' });
    }

    const cleanCorrectAnswer = parseInt(correctAnswer, 10);
    if (isNaN(cleanCorrectAnswer) || cleanCorrectAnswer < 0 || cleanCorrectAnswer >= parsedOptions.length) {
      return res.status(400).json({
        success: false,
        message: `Correct answer index must be between 0 and ${parsedOptions.length - 1}.`
      });
    }

    const cleanDifficulty = (difficulty || 'Medium').trim();
    if (!VALID_DIFFICULTIES.includes(cleanDifficulty)) {
      return res.status(400).json({
        success: false,
        message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`
      });
    }

    const newQuestion = await Question.create({
      skill: skill.trim(),
      question: question.trim(),
      options: parsedOptions,
      correctAnswer: cleanCorrectAnswer,
      difficulty: cleanDifficulty,
      explanation: (explanation || '').trim(),
      createdBy: req.user?.id || req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully in MongoDB!',
      question: newQuestion
    });
  } catch (error) {
    console.error('Create Question Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating question: ' + error.message });
  }
};

/**
 * GET /api/questions/admin
 * [ADMIN ONLY] List all questions with correct answers and filter support
 */
export const getAdminQuestions = async (req, res) => {
  try {
    const { skill, difficulty, search } = req.query;
    const filter = {};

    if (skill && skill !== 'All') {
      filter.skill = { $regex: new RegExp(`^${skill}$`, 'i') };
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    if (search && search.trim()) {
      filter.question = { $regex: search.trim(), $options: 'i' };
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get Admin Questions Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading questions: ' + error.message });
  }
};

/**
 * PUT /api/questions/:id
 * [ADMIN ONLY] Update an existing question
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill, question, options, correctAnswer, difficulty, explanation } = req.body;

    const existing = await Question.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    if (skill !== undefined) existing.skill = skill.trim();
    if (question !== undefined) existing.question = question.trim();

    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ success: false, message: 'Options must contain at least 2 items.' });
      }
      existing.options = options.map(o => String(o).trim()).filter(Boolean);
    }

    if (correctAnswer !== undefined) {
      const cleanAns = parseInt(correctAnswer, 10);
      if (isNaN(cleanAns) || cleanAns < 0 || cleanAns >= existing.options.length) {
        return res.status(400).json({
          success: false,
          message: `Correct answer index must be between 0 and ${existing.options.length - 1}.`
        });
      }
      existing.correctAnswer = cleanAns;
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`
        });
      }
      existing.difficulty = difficulty;
    }

    if (explanation !== undefined) {
      existing.explanation = explanation.trim();
    }

    await existing.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully in MongoDB!',
      question: existing
    });
  } catch (error) {
    console.error('Update Question Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating question: ' + error.message });
  }
};

/**
 * DELETE /api/questions/:id
 * [ADMIN ONLY] Delete a question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully from MongoDB.'
    });
  } catch (error) {
    console.error('Delete Question Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting question: ' + error.message });
  }
};

/**
 * POST /api/questions/seed
 * Seed initial database questions from default question banks if database is empty
 */
export const seedQuestions = async (req, res) => {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      return res.status(200).json({
        success: true,
        message: `Database already contains ${count} questions.`,
        count
      });
    }

    const docsToInsert = [];
    Object.keys(QUESTION_BANKS).forEach((skillName) => {
      const bank = QUESTION_BANKS[skillName];
      bank.forEach((q, idx) => {
        let diff = 'Medium';
        if (idx === 0 || idx === 1) diff = 'Easy';
        else if (idx === 3 || idx === 4) diff = 'Hard';

        docsToInsert.push({
          skill: skillName,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctOption,
          difficulty: diff,
          explanation: q.explanation || ''
        });
      });
    });

    const inserted = await Question.insertMany(docsToInsert);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} questions across ${Object.keys(QUESTION_BANKS).length} skills into MongoDB!`,
      count: inserted.length
    });
  } catch (error) {
    console.error('Seed Questions Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error seeding questions: ' + error.message });
  }
};

/**
 * GET /api/questions/skills
 * [STUDENT & ADMIN] Get all available skills that have questions in MongoDB
 */
export const getAvailableSkills = async (req, res) => {
  try {
    // Check if we need to auto-seed
    const count = await Question.countDocuments();
    if (count === 0) {
      const docsToInsert = [];
      Object.keys(QUESTION_BANKS).forEach((skillName) => {
        const bank = QUESTION_BANKS[skillName];
        bank.forEach((q, idx) => {
          let diff = 'Medium';
          if (idx === 0 || idx === 1) diff = 'Easy';
          else if (idx === 3 || idx === 4) diff = 'Hard';

          docsToInsert.push({
            skill: skillName,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctOption,
            difficulty: diff,
            explanation: q.explanation || ''
          });
        });
      });
      await Question.insertMany(docsToInsert);
    }

    const skills = await Question.distinct('skill');
    res.status(200).json({
      success: true,
      skills: skills.sort()
    });
  } catch (error) {
    console.error('Get Available Skills Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving skills: ' + error.message });
  }
};

/**
 * GET /api/questions/student
 * [STUDENTS ONLY] Retrieve questions for student assessment.
 * CRITICAL: NEVER exposes correctAnswer or explanation before submission!
 */
export const getStudentQuestions = async (req, res) => {
  try {
    const { skill, difficulty } = req.query;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ success: false, message: 'Skill parameter is required.' });
    }

    const filter = {
      skill: { $regex: new RegExp(`^${skill.trim()}$`, 'i') }
    };

    if (difficulty && difficulty !== 'All' && VALID_DIFFICULTIES.includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    // NEVER expose correctAnswer or explanation to students before submission!
    const questions = await Question.find(filter)
      .select('-correctAnswer -explanation -createdBy')
      .limit(10);

    if (questions.length === 0) {
      // Fallback query without difficulty filter
      const anyQuestions = await Question.find({ skill: { $regex: new RegExp(`^${skill.trim()}$`, 'i') } })
        .select('-correctAnswer -explanation -createdBy')
        .limit(10);

      return res.status(200).json({
        success: true,
        skill: skill.trim(),
        totalQuestions: anyQuestions.length,
        questions: anyQuestions
      });
    }

    res.status(200).json({
      success: true,
      skill: skill.trim(),
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get Student Questions Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading assessment questions: ' + error.message });
  }
};

/**
 * POST /api/questions/submit
 * [STUDENTS] Submit answers, calculate score against MongoDB records, store AssessmentResult
 */
export const submitStudentAssessment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { skill, answers, timeTakenSeconds } = req.body;

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    // Fetch the real questions from MongoDB WITH correctAnswer and explanation
    const questionIds = Object.keys(answers || {});
    let dbQuestions = [];

    if (questionIds.length > 0) {
      dbQuestions = await Question.find({ _id: { $in: questionIds } });
    } else {
      dbQuestions = await Question.find({ skill: { $regex: new RegExp(`^${skill.trim()}$`, 'i') } });
    }

    if (dbQuestions.length === 0) {
      return res.status(404).json({ success: false, message: `No questions found for skill: ${skill}` });
    }

    let correctCount = 0;
    const userAnswersList = [];

    dbQuestions.forEach((q) => {
      const selectedOpt = answers?.[q._id.toString()] !== undefined ? parseInt(answers[q._id.toString()], 10) : -1;
      const isCorrect = selectedOpt === q.correctAnswer;

      if (isCorrect) {
        correctCount += 1;
      }

      userAnswersList.push({
        questionId: q._id.toString(),
        questionText: q.question,
        selectedOption: selectedOpt,
        correctOption: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const totalQuestions = dbQuestions.length;
    const wrongCount = totalQuestions - correctCount;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 40;

    // Determine skill level:
    // 0-39 = Beginner, 40-59 = Intermediate, 60-79 = Advanced, 80-100 = Expert
    let skillLevel = 'Beginner';
    if (percentage >= 80) {
      skillLevel = 'Expert';
    } else if (percentage >= 60) {
      skillLevel = 'Advanced';
    } else if (percentage >= 40) {
      skillLevel = 'Intermediate';
    } else {
      skillLevel = 'Beginner';
    }

    // 1. Store Assessment Result in MongoDB
    const resultDoc = await AssessmentResult.create({
      userId,
      skill: skill.trim(),
      category: 'Technical',
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      score,
      percentage,
      scorePercentage: percentage,
      skillLevel,
      proficiencyEarned: skillLevel,
      passed,
      userAnswers: userAnswersList,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    // 2. Update StudentProfile in MongoDB
    let profile = await StudentProfile.findOne({ userId });
    if (profile) {
      const existingSkill = profile.skillsList.find(
        s => s.name.toLowerCase() === skill.trim().toLowerCase()
      );

      if (existingSkill) {
        existingSkill.proficiency = skillLevel;
      } else {
        profile.skillsList.push({
          name: skill.trim(),
          category: 'Technical',
          proficiency: skillLevel
        });
      }

      if (!profile.skills.includes(skill.trim())) {
        profile.skills.push(skill.trim());
      }

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: `Assessment for ${skill} submitted and scored successfully!`,
      result: {
        id: resultDoc._id,
        skill: skill.trim(),
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        score,
        percentage,
        scorePercentage: percentage,
        skillLevel,
        proficiencyEarned: skillLevel,
        passed,
        timeTakenSeconds: timeTakenSeconds || 0,
        userAnswers: userAnswersList,
        createdAt: resultDoc.createdAt
      }
    });
  } catch (error) {
    console.error('Submit Student Assessment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error scoring assessment: ' + error.message });
  }
};

/**
 * GET /api/questions/admin/results
 * [ADMIN ONLY] List all student assessment submissions & scores
 */
export const getAdminAssessmentResults = async (req, res) => {
  try {
    const { skill, search, skillLevel } = req.query;
    const query = {};

    if (skill && skill !== 'All') {
      query.skill = { $regex: new RegExp(`^${skill}$`, 'i') };
    }

    if (skillLevel && skillLevel !== 'All') {
      query.$or = [
        { skillLevel: skillLevel },
        { proficiencyEarned: skillLevel }
      ];
    }

    const results = await AssessmentResult.find(query)
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const formatted = results.map(r => ({
      _id: r._id,
      studentName: r.userId?.name || 'Student Candidate',
      studentEmail: r.userId?.email || 'N/A',
      avatarUrl: r.userId?.avatarUrl || null,
      skill: r.skill,
      score: r.score,
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      percentage: r.percentage ?? r.scorePercentage ?? Math.round((r.correctAnswers / (r.totalQuestions || 1)) * 100),
      skillLevel: r.skillLevel || r.proficiencyEarned || 'Beginner',
      passed: r.passed,
      date: r.createdAt
    }));

    let finalResults = formatted;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalResults = formatted.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        r.skill.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: finalResults.length,
      results: finalResults
    });
  } catch (error) {
    console.error('Get Admin Assessment Results Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving assessment results: ' + error.message });
  }
};
