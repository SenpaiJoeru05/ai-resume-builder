export function ProgressIndicator({ currentStep, totalSteps, steps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-slate-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-all ${
              index < currentStep
                ? 'bg-blue-600'
                : index === currentStep - 1
                ? 'bg-blue-600'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <span
            key={index}
            className={`text-xs ${
              index < currentStep
                ? 'text-blue-600 font-medium'
                : index === currentStep - 1
                ? 'text-blue-600 font-medium'
                : 'text-slate-400'
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
