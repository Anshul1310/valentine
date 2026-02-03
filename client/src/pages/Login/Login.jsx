// src/pages/Login/Login.jsx
import styles from './Login.module.css'; // Assume you have button styles here

const Login = () => {
  const handleDAuth = () => {
    // 1. Configuration
    const CLIENT_ID = '6Fb-R8UuftYlNZU5';
    const REDIRECT_URI = 'http://localhost:3000/auth/callback';
    
    // 2. Redirect to Delta
    window.location.href = `https://auth.delta.nitt.edu/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&grant_type=authorization_code&scope=email+profile+user`;
  };

  return (
    <div className={styles.container}>
      <h2>Welcome Back!</h2>
      <button onClick={handleDAuth} className={styles.deltaButton}>
        Login with NITT Webmail (DAuth)
      </button>
    </div>
  );
};

export default Login;