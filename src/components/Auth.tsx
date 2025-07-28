import "../styles/Auth.css";
import type { UserProfile } from "../types/UserProfile";


interface AuthProps {
  profile: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}


const Auth: React.FC<AuthProps> = ({ profile, onLogin, onLogout }) => {

  return (
    <div className="auth-container">
      {profile ? (
        <div className="profile-container">
            <img
              src={profile.picture}
              alt="user"
              className="profile-picture"
            />
          <button onClick={onLogout} className="logout-button">
            Log Out
          </button>
        </div>
      ) : (
        <button onClick={onLogin} className="auth-button">
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default Auth;
