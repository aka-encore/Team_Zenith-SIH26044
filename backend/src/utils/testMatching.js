import { calculateCompatibility } from './matchingEngine.js';

const runMatchEngineTests = () => {
  console.log('--- Starting Weighted Compatibility Matching Engine Tests ---\n');

  // Define a mock opportunity
  const mockOpp = {
    title: 'React infrastructure developer',
    type: 'internship',
    requiredSkills: ['React', 'Node.js', 'Tailwind', 'Git'],
    location: 'Remote'
  };

  // Define Profile 1: Ideal High Match (Expect score ~100%)
  const profileHigh = {
    skills: ['react', 'node.js', 'tailwind', 'git', 'mongodb'],
    academicInformation: {
      year: 4,
      cgpa: 9.5,
      college: 'SIH Academy'
    },
    location: 'Mumbai' // opportunity is remote, so location should match 100%
  };

  // Define Profile 2: Medium Match (Expect score ~60-70%)
  // - Skills: 2 out of 4 matches (React, Tailwind) = 50% of skills weight = 25 pts
  // - CGPA: 8.2 = 16 pts
  // - Year: 3 = 12 pts
  // - Location: Pune (opportunity is Remote, so it still matches 100% location = 15 pts)
  // Total expected: 25 + 16 + 12 + 15 = 68%
  const profileMedium = {
    skills: ['react', 'tailwind', 'python'],
    academicInformation: {
      year: 3,
      cgpa: 8.2
    },
    location: 'Pune'
  };

  // Define Profile 3: Low Match (Expect score ~20-30%)
  // - Skills: 0 out of 4 matches = 0 pts
  // - CGPA: 5.5 = 4 pts
  // - Year: 1 = 4 pts
  // - Location: mismatch = 5 pts
  // Total expected: 0 + 4 + 4 + 5 = 13%
  const profileLow = {
    skills: ['java', 'c++'],
    academicInformation: {
      year: 1,
      cgpa: 5.5
    },
    location: 'Chennai'
  };

  try {
    // 1. Assert Profile High
    const scoreHigh = calculateCompatibility(profileHigh, mockOpp);
    console.log(`      Candidate High Score: ${scoreHigh}%`);
    if (scoreHigh !== 100) {
      throw new Error(`FAIL: High match compatibility calculated as ${scoreHigh}%, expected 100%`);
    }
    console.log('      ASSERT PASS: High compatibility matching math asserts 100% score.');

    // 2. Assert Profile Medium
    const scoreMedium = calculateCompatibility(profileMedium, mockOpp);
    console.log(`      Candidate Medium Score: ${scoreMedium}%`);
    if (scoreMedium !== 68) {
      throw new Error(`FAIL: Medium match compatibility calculated as ${scoreMedium}%, expected 68%`);
    }
    console.log('      ASSERT PASS: Medium compatibility matching math asserts 68% score.');

    // 3. Assert Profile Low
    const scoreLow = calculateCompatibility(profileLow, { ...mockOpp, location: 'Bengaluru' }); // change location to trigger mismatch
    console.log(`      Candidate Low Score: ${scoreLow}%`);
    if (scoreLow !== 13) {
      throw new Error(`FAIL: Low match compatibility calculated as ${scoreLow}%, expected 13%`);
    }
    console.log('      ASSERT PASS: Low compatibility matching math asserts 13% score.');

    // 4. Assert Sorting List
    const candidates = [
      { name: 'Low Candidate', score: scoreLow },
      { name: 'High Candidate', score: scoreHigh },
      { name: 'Medium Candidate', score: scoreMedium }
    ];

    candidates.sort((a, b) => b.score - a.score);
    if (candidates[0].name === 'High Candidate' && candidates[1].name === 'Medium Candidate' && candidates[2].name === 'Low Candidate') {
      console.log('      ASSERT PASS: Successfully sorted candidates descending by compatibility score.');
    } else {
      throw new Error('FAIL: Candidates sorting failed.');
    }

    console.log('\n--- All Weighted Match Engine Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Weighted Match Engine Integration Test FAILED !!!');
    console.error(error.message);
  }
};

runMatchEngineTests();
