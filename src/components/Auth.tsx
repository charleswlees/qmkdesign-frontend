import { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import "../styles/Auth.css";

interface UserProfile {
  name: string;
  picture: string;
  email: string;
}

function Auth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken"),
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      localStorage.setItem("authToken", tokenResponse.access_token);
      setToken(tokenResponse.access_token);
      setProfile
    },
    onError: error => console.log("Login Failed:", error),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setProfile(res.data);
        } catch (err) {
          console.log("Failed to fetch profile:", err);
          logOut();
        }
      }
    };

    fetchProfile();
  }, [token]);

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("authToken");
    setToken(null);
    setProfile(null);
  };

  return (
    <div className="auth-container">
      {profile ? (
        <div className="profile-container">
            <img
              src={profile.picture}
              alt="user"
              className="profile-picture"
            />
          <button onClick={logOut} className="logout-button">
            Log Out
          </button>
        </div>
      ) : (
        <button onClick={() => login()} className="auth-button">
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default Auth;
