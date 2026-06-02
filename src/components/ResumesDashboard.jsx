export function ResumesDashboard({ resumes, activeResumeId, setActiveResumeId, createResume, deleteResume, duplicateResume }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getResumePreview = (resume) => {
    const name = resume.personalInfo?.fullName || 'Untitled';
    const title = resume.professionalInfo?.jobTitle || 'No job title';
    return { name, title };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">My Resumes</h3>
        <button
          onClick={() => createResume('New Resume')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Resume
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map((resume) => {
          const { name, title } = getResumePreview(resume);
          const isActive = resume.meta.id === activeResumeId;
          
          return (
            <div
              key={resume.meta.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                isActive ? 'border-blue-600' : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setActiveResumeId(resume.meta.id)}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="font-semibold text-slate-900 text-lg mb-1">{resume.meta.title}</h4>
                <p className="text-slate-600 text-sm">{name}</p>
                <p className="text-slate-500 text-xs mt-1">{title}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Last updated: {formatDate(resume.meta.updatedAt)}</span>
                <span className="px-2 py-1 bg-slate-100 rounded-full">{resume.meta.template}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateResume(resume.meta.id);
                  }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                >
                  Duplicate
                </button>
                {resumes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this resume?')) {
                        deleteResume(resume.meta.id);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {resumes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No resumes yet</h3>
          <p className="text-slate-600 mb-4">Create your first resume to get started</p>
          <button
            onClick={() => createResume('My First Resume')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Create Resume
          </button>
        </div>
      )}
    </div>
  );
}
