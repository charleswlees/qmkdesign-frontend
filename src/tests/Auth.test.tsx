import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll, type Mock } from 'vitest';
import Auth from '../components/Auth';
import axios from 'axios';


vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock console
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});



Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});


describe('Auth', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockUserProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    picture: 'https://example.com/picture.jpg',
  };

  const loggedInProps = {
    profile: mockUserProfile,
    onLogin: mockLogin,
    onLogout: mockLogout
  }

  const loggedOutProps = {
    profile: null,
    onLogin: mockLogin,
    onLogout: mockLogout
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders sign in button when not authenticated', () => {
    render(<Auth {...loggedOutProps} />);
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });

  it('initiates Google login when sign in button is clicked', () => {
    render(<Auth {...loggedOutProps} />);
    
    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);
    
    expect(mockLogin).toHaveBeenCalled();
  });


  it('handles logout', async () => {
                            
    const mockToken = 'test-token';
    mockLocalStorage.setItem('authToken', mockToken);
    (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });
    
    render(<Auth {...loggedInProps}/>);
    
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
    
    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);
    
    expect(loggedInProps.onLogout).toHaveBeenCalled();
    
  });

});
