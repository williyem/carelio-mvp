import { useState, useCallback } from 'react';

interface UseMultiStepOptions<T> {
  initialStep?: number;
  totalSteps: number;
  onStepChange?: (step: number) => void;
  initialData?: T;
}

interface UseMultiStepReturn<T> {
  currentStep: number;
  stepData: T;
  isFirstStep: boolean;
  isLastStep: boolean;
  next: (data?: Partial<T>) => void;
  previous: () => void;
  goToStep: (step: number, data?: Partial<T>) => void;
  updateStepData: (data: Partial<T>) => void;
  reset: () => void;
}

export function useMultiStep<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  initialStep = 0,
  totalSteps,
  onStepChange,
  initialData = {} as T,
}: UseMultiStepOptions<T>): UseMultiStepReturn<T> {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState<T>(initialData as T);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const next = useCallback(
    (data?: Partial<T>) => {
      if (currentStep < totalSteps - 1) {
        if (data) {
          setStepData((prev) => ({ ...prev, ...data }) as T);
        }
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
      }
    },
    [currentStep, totalSteps, onStepChange]
  );

  const previous = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = useCallback(
    (step: number, data?: Partial<T>) => {
      if (step >= 0 && step < totalSteps) {
        if (data) {
          setStepData((prev) => ({ ...prev, ...data }) as T);
        }
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  const updateStepData = useCallback((data: Partial<T>) => {
    setStepData((prev) => ({ ...prev, ...data }) as T);
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setStepData(initialData as T);
  }, [initialStep, initialData]);

  return {
    currentStep,
    stepData,
    isFirstStep,
    isLastStep,
    next,
    previous,
    goToStep,
    updateStepData,
    reset,
  };
}
