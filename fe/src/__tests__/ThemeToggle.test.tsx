import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from 'next-themes';

// Mock the useTheme hook
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

// Mock react-feather icons
jest.mock('react-feather', () => ({
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
}));

describe('ThemeToggle', () => {
  it('renders properly', () => {
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Check if the toggle button exists
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('changes theme when toggled', () => {
    const setThemeMock = jest.fn();
    
    // Override the mock for this specific test
    require('next-themes').useTheme.mockImplementation(() => ({
      theme: 'light',
      setTheme: setThemeMock,
    }));
    
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Check if setTheme was called with 'dark'
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('reflects the current theme state', () => {
    // Mock for dark theme
    require('next-themes').useTheme.mockImplementation(() => ({
      theme: 'dark',
      setTheme: jest.fn(),
    }));
    
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // In dark mode, we show the Sun icon
    expect(screen.getByLabelText('Chuyển sang chế độ sáng')).toBeInTheDocument();
  });
});
