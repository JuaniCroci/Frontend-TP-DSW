import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { RegisterInput } from '../../../models/Auth';
import type { Usuario } from '../../../models/Usuario';

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post<Usuario>('/api/auth/register', input);
      return data;
    },
  });
}
