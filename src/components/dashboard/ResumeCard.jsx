export function ResumeCard({ resume, isActive, onSelect, onDuplicate, onDelete, canDelete }) {
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

  const { name, title } = getResumePreview(resume);

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isActive ? 'border-blue-600' : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
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
            onDuplicate(resume.meta.id);
          }}
          className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
        >
          Duplicate
        </button>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this resume?')) {
                onDelete(resume.meta.id);
              }
            }}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
