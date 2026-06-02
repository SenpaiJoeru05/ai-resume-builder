export function CompletenessMeter({ resume }) {
  const calculateCompleteness = () => {
    let score = 0;
    let maxScore = 0;

    // Personal Info (20 points)
    maxScore += 20;
    if (resume.personalInfo?.fullName) score += 5;
    if (resume.personalInfo?.email) score += 5;
    if (resume.personalInfo?.phone) score += 5;
    if (resume.personalInfo?.address) score += 5;

    // Professional Info (15 points)
    maxScore += 15;
    if (resume.professionalInfo?.jobTitle) score += 5;
    if (resume.professionalInfo?.industry) score += 5;
    if (resume.professionalInfo?.seniority) score += 5;

    // Summary (15 points)
    maxScore += 15;
    if (resume.summary && resume.summary.length > 50) score += 15;
    else if (resume.summary) score += 5;

    // Experience (20 points)
    maxScore += 20;
    if (resume.experience?.length > 0) score += 10;
    if (resume.experience?.some(exp => exp.bullets?.length > 0)) score += 10;

    // Education (10 points)
    maxScore += 10;
    if (resume.education?.length > 0) score += 10;

    // Skills (10 points)
    maxScore += 10;
    if (resume.skills?.length > 0) score += 10;

    // Optional sections (10 points)
    maxScore += 10;
    if (resume.projects?.length > 0) score += 2.5;
    if (resume.certifications?.length > 0) score += 2.5;
    if (resume.languages?.length > 0) score += 2.5;
    if (resume.awards?.length > 0) score += 2.5;

    return Math.round((score / maxScore) * 100);
  };

  const completeness = calculateCompleteness();
  const getColor = () => {
    if (completeness >= 80) return 'bg-emerald-500';
    if (completeness >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatus = () => {
    if (completeness >= 80) return 'Excellent';
    if (completeness >= 50) return 'In Progress';
    return 'Just Started';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Resume Completeness</h3>
        <span className="text-xs font-medium text-slate-600">{completeness}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div
          className={`${getColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${completeness}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{getStatus()}</p>
    </div>
  );
}
