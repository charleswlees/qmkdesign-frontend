import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll, type Mock } from 'vitest';
import Auth from '../components/Auth';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';

// Mock the Google OAuth library
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(),
  googleLogout: vi.fn(),
}));

// Mock axios
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

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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

  it('handles login flow from start to finish', async () => {
    let onSuccessCallback: (response: any) => void = () => {};
    
    (useGoogleLogin as Mock).mockImplementation((config) => {
      onSuccessCallback = config.onSuccess;
      return mockLogin;
    });
    
    (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });
    
    render(<Auth />);
    
    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);
    
    const mockToken = 'test-token-123';
    
    await act(async () => {
      onSuccessCallback({ access_token: mockToken });
    });
    
    expect(mockLocalStorage.getItem('authToken')).toBe(mockToken);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
    
    const img = screen.getByAltText('user') as HTMLImageElement;
    expect(img.src).toBe(mockUserProfile.picture);
  });

  it('handles login error', () => {
    let onErrorCallback: (error: any) => void = () => {};
    
    (useGoogleLogin as Mock).mockImplementation((config) => {
      onErrorCallback = config.onError;
      return mockLogin;
    });
    
    render(<Auth />);
    
    const error = new Error('Login failed');
    onErrorCallback(error);
    
    expect(consoleSpy).toHaveBeenCalledWith('Login Failed:', error);
  });

  it('automatically fetches profile if token exists', async () => {
                                 
    const mockToken = 'existing-token';
    mockLocalStorage.setItem('authToken', mockToken);
    
    (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });
    
    render(<Auth />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
      expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument();
    });
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

  it('handles failed profile fetch', async () => {
    const mockToken = 'bad-token';
    mockLocalStorage.setItem('authToken', mockToken);
    
    (axios.get as Mock).mockRejectedValue(new Error('Unauthorized'));
    
    render(<Auth />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(googleLogout).toHaveBeenCalled();
      expect(mockLocalStorage.getItem('authToken')).toBeNull();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });
  });

  it('handles image error with initials fallback', async () => {
    const mockToken = 'test-token';
    mockLocalStorage.setItem('authToken', mockToken);
    (axios.get as Mock).mockResolvedValue({ data: mockUserProfile });
    
    render(<Auth />);
    
    await waitFor(() => {
      const img = screen.getByAltText('user');
      expect(img).toBeInTheDocument();
    });
    
    const img = screen.getByAltText('user');
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });


});
