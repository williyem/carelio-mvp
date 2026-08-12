import { useMutation } from '@tanstack/react-query';
import { assignHealthAssistant } from './api-functions';

const useHealthAssistantMutations = () => {
  const assignHealthAssistantMutation = useMutation({
    mutationFn: assignHealthAssistant,
  });

  return {
    assignHealthAssistantMutation,
  };
};

export default useHealthAssistantMutations;
