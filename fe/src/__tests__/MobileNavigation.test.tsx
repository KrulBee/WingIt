import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileNavigation from '@/components/MobileNavigation';

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/home'),
}));

// Mock ThemeToggle component
jest.mock('@/components/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

// Mock react-feather icons
jest.mock('react-feather', () => ({
  Home: () => <div>Home Icon</div>,
  User: () => <div>User Icon</div>,
  Settings: () => <div>Settings Icon</div>,
  Search: () => <div>Search Icon</div>,
  Bell: () => <div>Bell Icon</div>,
  MessageCircle: () => <div>Message Icon</div>,
  Users: () => <div>Users Icon</div>,
  Bookmark: () => <div>Bookmark Icon</div>,
  Menu: () => <div>Menu Icon</div>,
  X: () => <div>X Icon</div>,
}));

describe('MobileNavigation', () => {
  it('renders the mobile menu button', () => {
    render(<MobileNavigation />);
    
    const menuButton = screen.getByLabelText('Toggle mobile menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('opens the menu when the button is clicked', () => {
    render(<MobileNavigation />);
    
    const menuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuButton);
    
    // Check if the menu is visible
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeVisible();
  });

  it('closes the menu when a navigation link is clicked', () => {
    render(<MobileNavigation />);
    
    // Open the menu first
    const menuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(menuButton);
    
    // Click on a navigation link
    const profileLink = screen.getByText('Profile');
    fireEvent.click(profileLink);
    
    // The menu should be closed
    expect(screen.queryByText('Profile')).not.toBeVisible();
  });
});
