import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll, type Mock } from 'vitest';
import Auth from '../components/Auth';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';

//Mock Methods
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(),
  googleLogout: vi.fn(),
}));

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

interface GoogleLoginError {
  error: string;
  error_description?: string;
}


Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});


describe('Auth', () => {
  const mockLogin = vi.fn();
  const mockUserProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    picture: 'https://example.com/picture.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    
    (useGoogleLogin as Mock).mockReturnValue(mockLogin);
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders sign in button when not authenticated', () => {
    render(<Auth />);
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });

  it('initiates Google login when sign in button is clicked', () => {
    render(<Auth />);
    
    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);
    
    expect(mockLogin).toHaveBeenCalled();
  });


  it('handles login error', () => {
    let onErrorCallback: (error: GoogleLoginError) => void = () => {};
    
    (useGoogleLogin as Mock).mockImplementation((config) => {
      onErrorCallback = config.onError;
      return mockLogin;
    });
    
    render(<Auth />);
    
    const error: GoogleLoginError = { error: 'Login failed' };
    onErrorCallback(error); 

    expect(consoleSpy).toHaveBeenCalledWith('Login Failed:', error);
  });

  it('handles logout', async () => {
                            
    const mockToken = 'test-token';
    mockLocalStorage.setItem('authToken', mockToken);
    (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });
    
    render(<Auth />);
    
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
    
    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);
    
    expect(googleLogout).toHaveBeenCalled();
    expect(mockLocalStorage.getItem('authToken')).toBeNull();
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });

});
