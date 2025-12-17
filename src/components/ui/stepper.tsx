/**
 * Stepper Component - Step-by-step wizard navigation
 */

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''}`}>
            <div className="flex items-center">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || index > currentStep}
                className={`
                  relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                  transition-colors
                  ${index < currentStep
                    ? 'bg-blue-600 text-white'
                    : index === currentStep
                      ? 'border-2 border-blue-600 bg-white text-blue-600'
                      : 'border-2 border-gray-300 bg-white text-gray-500'
                  }
                  ${onStepClick && index <= currentStep ? 'cursor-pointer hover:bg-blue-700 hover:text-white' : ''}
                `}
              >
                {index < currentStep ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              {index !== steps.length - 1 && (
                <div className={`absolute left-8 top-4 h-0.5 w-full ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
            <div className="mt-2">
              <span className={`text-xs font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export interface StepContentProps {
  children: React.ReactNode;
}

export function StepContent({ children }: StepContentProps) {
  return <div className="mt-4">{children}</div>;
}
