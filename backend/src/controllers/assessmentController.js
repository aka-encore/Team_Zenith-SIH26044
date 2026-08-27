import AssessmentResult from '../models/AssessmentResult.js';
import StudentProfile from '../models/StudentProfile.js';
import { SKILLS_CATALOG, QUESTION_BANKS } from '../data/assessmentQuestions.js';

/**
 * GET /api/assessment/catalog
 * Returns available assessment skill modules
 */
export const getCatalog = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      catalog: SKILLS_CATALOG
    });
  } catch (error) {
    console.error('Get Catalog Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading skills catalog: ' + error.message });
  }
};

/**
 * GET /api/assessment/questions?skill=React
 * Returns questions for selected skill without revealing the answer key
 */
export const getQuestions = async (req, res) => {
  try {
    const rawSkill = req.query.skill || 'JavaScript';
    
    // Case-insensitive skill match
    const skillKey = Object.keys(QUESTION_BANKS).find(
      k => k.toLowerCase() === rawSkill.toLowerCase()
    ) || 'JavaScript';

    const fullBank = QUESTION_BANKS[skillKey];
    if (!fullBank || fullBank.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No assessment questions found for skill: ${rawSkill}`
      });
    }

    // Sanitize questions: strip `correctOption` and `explanation` so client cannot cheat
    const sanitizedQuestions = fullBank.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    const catalogItem = SKILLS_CATALOG.find(c => c.name.toLowerCase() === skillKey.toLowerCase()) || {
      name: skillKey,
      category: 'General',
      durationMinutes: 5
    };

    res.status(200).json({
      success: true,
      skill: skillKey,
      category: catalogItem.category,
      durationMinutes: catalogItem.durationMinutes,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Get Questions Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving questions: ' + error.message });
  }
};

/**
 * POST /api/assessment/submit
 * Computes score dynamically from submitted answers, assigns proficiency, stores in MongoDB
 */
export const submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { skill, answers, timeTakenSeconds } = req.body;

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill name is required for assessment submission.' });
    }

    const skillKey = Object.keys(QUESTION_BANKS).find(
      k => k.toLowerCase() === skill.toLowerCase()
    );

    if (!skillKey || !QUESTION_BANKS[skillKey]) {
      return res.status(404).json({ success: false, message: `Assessment not found for skill: ${skill}` });
    }

    const fullBank = QUESTION_BANKS[skillKey];
    const totalQuestions = fullBank.length;
    let correctCount = 0;
    const userAnswersList = [];

    // Score each question
    fullBank.forEach((q) => {
      const selectedOpt = answers?.[q.id] !== undefined ? parseInt(answers[q.id], 10) : -1;
      const isCorrect = selectedOpt === q.correctOption;

      if (isCorrect) {
        correctCount += 1;
      }

      userAnswersList.push({
        questionId: q.id,
        questionText: q.question,
        selectedOption: selectedOpt,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const wrongCount = totalQuestions - correctCount;
    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 40;

    // Determine earned skill level:
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

    const catalogItem = SKILLS_CATALOG.find(c => c.name.toLowerCase() === skillKey.toLowerCase());
    const category = catalogItem?.category || 'Technical';

    // 1. Save Assessment Result to MongoDB
    const resultDoc = await AssessmentResult.create({
      userId,
      skill: skillKey,
      category,
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

    // 2. Automatically update/sync StudentProfile skills in MongoDB
    let profile = await StudentProfile.findOne({ userId });
    if (profile) {
      const existingSkill = profile.skillsList.find(
        s => s.name.toLowerCase() === skillKey.toLowerCase()
      );

      if (existingSkill) {
        existingSkill.proficiency = skillLevel;
        existingSkill.category = category;
      } else {
        profile.skillsList.push({
          name: skillKey,
          category,
          proficiency: skillLevel
        });
      }

      if (!profile.skills.includes(skillKey)) {
        profile.skills.push(skillKey);
      }

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: `Assessment for ${skillKey} submitted and scored successfully!`,
      result: {
        id: resultDoc._id,
        skill: skillKey,
        category,
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
    console.error('Submit Assessment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing assessment: ' + error.message });
  }
};

/**
 * GET /api/assessment/history
 * Returns the student's past assessment history from MongoDB
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const history = await AssessmentResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get History Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading assessment history: ' + error.message });
  }
};
