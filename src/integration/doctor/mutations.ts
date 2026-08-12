import { useMutation } from '@tanstack/react-query';
import { getDoctorConsultationToken } from './api-function';

const useGetDoctorConsultationToken = () => {
  const getDoctorConsultationTokenMutation = useMutation({
    mutationFn: getDoctorConsultationToken,
  });

  return { getDoctorConsultationTokenMutation };
};

export default useGetDoctorConsultationToken;
