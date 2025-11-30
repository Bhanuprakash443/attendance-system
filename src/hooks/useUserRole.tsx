import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user, loading } = useAuth();

  return {
    role: user?.role || null,
    loading,
  };
};
