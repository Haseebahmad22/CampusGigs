function mapProfileRowToResponse(row, skills = []) {
  return {
    id: row.profile_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    bio: row.bio,
    headline: row.headline,
    hourlyRate: row.hourly_rate !== null ? Number(row.hourly_rate) : null,
    avatarUrl: row.avatar_url,
    location: row.location,
    university: row.university,
    department: row.department,
    semester: row.semester,
    languages: row.languages || [],
    availability: row.availability,
    totalEarnings: row.total_earnings !== null ? Number(row.total_earnings) : 0,
    totalJobsCompleted: row.total_jobs_completed || 0,
    averageRating: row.average_rating !== null ? Number(row.average_rating) : 0,
    profileCompletionPct:
      row.profile_completion_pct !== null && row.profile_completion_pct !== undefined
        ? Number(row.profile_completion_pct)
        : 0,
    skills,
    createdAt: row.profile_created_at || row.user_created_at,
    updatedAt: row.profile_updated_at || row.user_updated_at,
  };
}

function calculateProfileCompletion(profileInput) {
  const checks = [
    Boolean(profileInput.fullName),
    Boolean(profileInput.headline),
    Boolean(profileInput.bio),
    profileInput.hourlyRate !== null && profileInput.hourlyRate !== undefined,
    Boolean(profileInput.avatarUrl),
    Boolean(profileInput.location),
    Boolean(profileInput.university),
    Boolean(profileInput.department),
    Boolean(profileInput.semester),
    Array.isArray(profileInput.languages) && profileInput.languages.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

module.exports = {
  mapProfileRowToResponse,
  calculateProfileCompletion,
};