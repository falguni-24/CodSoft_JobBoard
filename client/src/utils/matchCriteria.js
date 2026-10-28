/**
 * Calculates Job Match Criteria between a candidate profile and a job listing.
 * Evaluates 4 core criteria:
 *  1. Skills Match (45% weight)
 *  2. Experience Level & Work History Match (25% weight)
 *  3. Location & Remote Flexibility Match (20% weight)
 *  4. Industry, Education & Role Alignment (10% weight)
 */

const EXPERIENCE_HIERARCHY = {
  'Entry Level': 1,
  'Mid Level': 2,
  'Senior Level': 3,
  'Lead / Principal': 4,
  'Executive': 5,
};

export const calculateJobMatch = (candidate, job) => {
  if (!job) {
    return { score: 0, level: 'Not Available', criteria: {} };
  }

  // If candidate is not logged in or has an empty profile, return neutral baseline
  if (!candidate || !candidate.profile) {
    return {
      score: null,
      level: 'Sign in to see match',
      isGuest: true,
      criteria: {},
    };
  }

  const candidateProfile = candidate.profile || {};
  const candidateSkills = (candidateProfile.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());

  // 1. SKILLS CRITERIA (45%)
  let matchedSkills = [];
  let missingSkills = [];
  let skillsScore = 0;

  if (jobSkills.length === 0) {
    skillsScore = 45; // If no skills specified, give full credit
  } else {
    job.skills.forEach((originalSkill) => {
      const lower = originalSkill.toLowerCase().trim();
      const isMatched = candidateSkills.some(
        (candSkill) => candSkill === lower || lower.includes(candSkill) || candSkill.includes(lower)
      );
      if (isMatched) {
        matchedSkills.push(originalSkill);
      } else {
        missingSkills.push(originalSkill);
      }
    });

    const ratio = matchedSkills.length / jobSkills.length;
    skillsScore = Math.round(ratio * 45);
  }

  // 2. EXPERIENCE LEVEL & HISTORY CRITERIA (25%)
  let experienceScore = 0;
  const workHistory = candidateProfile.experience || [];
  const candidateExpRank =
    EXPERIENCE_HIERARCHY[candidateProfile.headline?.includes('Senior') ? 'Senior Level' : 'Mid Level'] ||
    (workHistory.length >= 4 ? 3 : workHistory.length >= 2 ? 2 : 1);
  const jobExpRank = EXPERIENCE_HIERARCHY[job.experience] || 2;

  let experienceStatus = 'Good Match';
  const hasDirectRoleExperience = workHistory.some(
    (exp) =>
      exp.title &&
      (exp.title.toLowerCase().includes(job.title.toLowerCase().slice(0, 10)) ||
        job.title.toLowerCase().includes(exp.title.toLowerCase()))
  );

  if (candidateExpRank >= jobExpRank || hasDirectRoleExperience) {
    experienceScore = 25;
    experienceStatus = hasDirectRoleExperience
      ? 'Relevant role experience verified in work history'
      : 'Meets or exceeds required experience level';
  } else if (candidateExpRank + 1 === jobExpRank) {
    experienceScore = 16;
    experienceStatus = 'Close to required experience level';
  } else {
    experienceScore = 9;
    experienceStatus = 'Requires more senior experience';
  }

  // 3. LOCATION & WORK MODE CRITERIA (20%)
  let locationScore = 0;
  let locationStatus = 'Location Mismatch';
  const jobLocationLower = (job.location || '').toLowerCase();
  const candLocationLower = (candidateProfile.location || '').toLowerCase();

  const isRemote =
    jobLocationLower.includes('remote') ||
    job.jobType === 'Remote' ||
    (job.description || '').toLowerCase().includes('remote');

  if (isRemote) {
    locationScore = 20;
    locationStatus = 'Full Match: Remote flexible position';
  } else if (
    candLocationLower &&
    jobLocationLower &&
    (candLocationLower.includes(jobLocationLower) || jobLocationLower.includes(candLocationLower))
  ) {
    locationScore = 20;
    locationStatus = `Full Match: Located in ${job.location}`;
  } else if (!candLocationLower) {
    locationScore = 12;
    locationStatus = 'Location flexible';
  } else {
    locationScore = 8;
    locationStatus = `Relocation or commute required to ${job.location}`;
  }

  // 4. INDUSTRY, EDUCATION & ROLE ALIGNMENT (10%)
  let categoryScore = 0;
  let categoryStatus = 'General Alignment';
  const headlineLower = (candidateProfile.headline || '').toLowerCase();
  const jobCategoryLower = (job.category || '').toLowerCase();
  const educationList = candidateProfile.education || [];

  const hasRelevantEducation = educationList.some(
    (edu) =>
      (edu.fieldOfStudy && edu.fieldOfStudy.toLowerCase().includes('computer')) ||
      (edu.fieldOfStudy && edu.fieldOfStudy.toLowerCase().includes('data')) ||
      (edu.fieldOfStudy && edu.fieldOfStudy.toLowerCase().includes('design')) ||
      (edu.degree && edu.degree.toLowerCase().includes('science'))
  );

  if (
    headlineLower &&
    (headlineLower.includes(jobCategoryLower) || jobCategoryLower.includes(headlineLower))
  ) {
    categoryScore = 10;
    categoryStatus = `Strong alignment with ${job.category}`;
  } else if (hasRelevantEducation) {
    categoryScore = 9;
    categoryStatus = 'Relevant degree/academic background verified';
  } else if (headlineLower) {
    categoryScore = 7;
    categoryStatus = 'Compatible professional profile';
  } else {
    categoryScore = 5;
    categoryStatus = 'Standard industry alignment';
  }

  // Total Score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(0, skillsScore + experienceScore + locationScore + categoryScore)
  );

  let matchLevel = 'Low Match';
  let badgeColor = 'slate';
  if (totalScore >= 75) {
    matchLevel = 'Strong Match';
    badgeColor = 'emerald';
  } else if (totalScore >= 50) {
    matchLevel = 'Good Match';
    badgeColor = 'sky';
  } else if (totalScore >= 30) {
    matchLevel = 'Fair Match';
    badgeColor = 'amber';
  }

  return {
    score: totalScore,
    level: matchLevel,
    badgeColor,
    isGuest: false,
    criteria: {
      skills: {
        score: skillsScore,
        maxScore: 45,
        matched: matchedSkills,
        missing: missingSkills,
        total: job.skills ? job.skills.length : 0,
        percentage: jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 100,
      },
      experience: {
        score: experienceScore,
        maxScore: 25,
        candidateLevel: candidateProfile.headline || 'Candidate Profile',
        requiredLevel: job.experience,
        status: experienceStatus,
        isMatch: candidateExpRank >= jobExpRank || hasDirectRoleExperience,
        workHistoryCount: workHistory.length,
      },
      location: {
        score: locationScore,
        maxScore: 20,
        isRemote,
        jobLocation: job.location,
        candidateLocation: candidateProfile.location || 'Not set',
        status: locationStatus,
      },
      category: {
        score: categoryScore,
        maxScore: 10,
        jobCategory: job.category,
        status: categoryStatus,
      },
    },
  };
};
