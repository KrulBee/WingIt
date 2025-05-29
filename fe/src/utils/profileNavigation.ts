import { useRouter } from 'next/navigation';

export const useProfileNavigation = () => {
  const router = useRouter();

  const navigateToProfile = (username: string, currentUsername?: string) => {
    // Don't navigate if clicking on own avatar
    if (currentUsername && username === currentUsername) {
      return;
    }
    
    // Navigate to user's profile
    router.push(`/profile/${username}`);
  };

  return { navigateToProfile };
};

// Helper function for components that don't use hooks
export const navigateToUserProfile = (username: string, currentUsername?: string) => {
  // Don't navigate if clicking on own avatar
  if (currentUsername && username === currentUsername) {
    return;
  }
  
  // Use window.location for non-hook usage
  window.location.href = `/profile/${username}`;
};
