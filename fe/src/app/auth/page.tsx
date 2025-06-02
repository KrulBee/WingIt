"use client";

import React from "react";
import * as Components from '../../components/LoginComponents';
import { useRouter } from 'next/navigation';
import AuthService from '../../services/AuthService';

interface CustomError {
  response?: {
    status: number;
    data: string;
  };
}

export default function Auth() {
  const [signIn, toggle] = React.useState<boolean>(true);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const router = useRouter();

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      console.log('🌐 Starting Google OAuth login...');
      setErrorMessage('');
      setSuccessMessage('');
      
      // Use the loginWithGoogle method that redirects directly
      AuthService.loginWithGoogle();
    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      setErrorMessage('Google đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  // Clear error and success messages when switching between forms
  React.useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }, [signIn]);  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    console.log('🔐 Starting login process...');
    console.log('📝 Username:', username);
    console.log('🔑 Password length:', password.length);
    
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (!username || specialCharRegex.test(username)) {
      console.log('❌ Validation failed: Invalid username');
      setErrorMessage('Tên đăng nhập không được để trống hoặc chứa ký tự đặc biệt.');
      setLoading(false);
      return;
    }
      if (password.length < 8) {
      console.log('❌ Validation failed: Password too short');
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      setLoading(false);
      return;
    }

    console.log('✅ Validation passed, making login request...');

    try {
      const response = await AuthService.signin({ username, password });
      console.log('🎯 Login response received:', response);
      
      // Only redirect if login was actually successful
      if (response && response.token) {
        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('🎫 JWT Token received:', response.token.substring(0, 20) + '...');
        
        // Store user data in localStorage for session management
        if (response.user) {
          console.log('👤 User data:', response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
          console.log('🏠 Redirecting to home page in 2 seconds...');
        setSuccessMessage('✅ Đăng nhập thành công! Đang chuyển hướng đến trang chủ...');
        
        setTimeout(() => {
          console.log('🚀 Navigating to /home');
          router.push('/home');
        }, 2000);
      } else {
        console.log('❌ Login failed: Invalid response structure');
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }
    } catch (error: any) {
      console.error('❌ LOGIN FAILED:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setErrorMessage(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại.');
    } finally {
      setLoading(false);
      console.log('🔄 Login process completed');
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    console.log('📝 Starting registration process...');
    console.log('👤 Username:', username);
    console.log('🔑 Password length:', password.length);
    
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!username || specialCharRegex.test(username)) {
      console.log('❌ Validation failed: Invalid username');
      setErrorMessage('Tên đăng nhập không được để trống hoặc chứa ký tự đặc biệt.');
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      console.log('❌ Validation failed: Password too short');
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('❌ Validation failed: Password mismatch');
      setErrorMessage('Xác nhận mật khẩu không khớp.');
      setLoading(false);
      return;
    }
    
    console.log('✅ Validation passed, making registration request...');
    
    try {
      const result = await AuthService.signup({ username, password });
      console.log('✅ REGISTRATION SUCCESSFUL!');
      console.log('🎯 Registration response:', result);
        setSuccessMessage('✅ Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản mới.');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      console.log('🔄 Switching to login form in 3 seconds...');
      // Switch to login form after successful registration
      setTimeout(() => {
        console.log('🔀 Switching to Sign In form');
        toggle(true);
      }, 3000);
    } catch (error: any) {
      console.error('❌ REGISTRATION FAILED:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      if (error.message.includes('User already exists')) {
        setErrorMessage('Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.');
      } else {
        setErrorMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      console.log('🔄 Registration process completed');
    }
  };

  function isCustomError(error: unknown): error is CustomError {
    return (
      typeof error === 'object' &&
      error !== null &&
      (error as CustomError).response !== undefined
    );
  }

  return (
    <div style={{height: '100vh', width: '100vw', alignItems:'center', display: 'flex',justifyContent: 'center', backgroundColor: '#ffffff'}}>      <Components.Container>        <Components.SignUpContainer $signIn={signIn}>
          <Components.Form onSubmit={handleSignUp}>
            <Components.Title style={{color: '#0088ff', fontSize: '40px'}}>Đăng Ký</Components.Title>
            {errorMessage && <p style={{ color: 'red', margin: '10px 0' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green', margin: '10px 0', fontWeight: 'bold' }}>{successMessage}</p>}
            {loading && <p style={{ color: '#0088ff', margin: '10px 0' }}>🔄 Đang đăng ký...</p>}
            <Components.Input 
              type='text' 
              placeholder='Tên đăng nhập' 
              value={username} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              style={{color: '#000000'}}
              disabled={loading}
            />
            <Components.Input 
              type='password' 
              placeholder='Mật khẩu' 
              value={password} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              style={{color: '#000000'}}
              disabled={loading}
            />
            <Components.Input 
              type='password' 
              placeholder='Xác nhận mật khẩu' 
              value={confirmPassword} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              style={{color: '#000000'}}
              disabled={loading}
            />            <Components.Button disabled={loading}>
              {loading ? '🔄 Đang đăng ký...' : 'Đăng Ký'}
            </Components.Button>
            
            <Components.OrDivider>
              <span>Hoặc</span>
            </Components.OrDivider>
            
            <Components.GoogleButton type="button" onClick={handleGoogleLogin} disabled={loading}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng ký với Google
            </Components.GoogleButton>
          </Components.Form>
        </Components.SignUpContainer><Components.SignInContainer $signIn={signIn}>
          <Components.Form onSubmit={handleSignIn}>
            <Components.Title style={{color: '#7700ff', fontSize: '40px'}}>Đăng Nhập</Components.Title>
            {errorMessage && <p style={{ color: 'red', margin: '10px 0' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green', margin: '10px 0', fontWeight: 'bold' }}>{successMessage}</p>}
            {loading && <p style={{ color: '#7700ff', margin: '10px 0' }}>🔄 {signIn ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</p>}
            <Components.Input 
              type='text' 
              placeholder='Tên đăng nhập' 
              value={username} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              style={{color: '#000000'}}
              disabled={loading}
            />
            <Components.Input 
              type='password' 
              placeholder='Mật khẩu' 
              value={password} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              style={{color: '#000000'}}
              disabled={loading}
            />            <Components.Button style={{background:'#7700ff'}} disabled={loading}>
              {loading ? '🔄 Đang đăng nhập...' : 'Đăng Nhập'}
            </Components.Button>
            
            <Components.OrDivider>
              <span>Hoặc</span>
            </Components.OrDivider>
            
            <Components.GoogleButton type="button" onClick={handleGoogleLogin} disabled={loading}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </Components.GoogleButton>
          </Components.Form>
        </Components.SignInContainer><Components.OverlayContainer $signIn={signIn}>
          <Components.Overlay $signIn={signIn}>            <Components.LeftOverlayPanel $signIn={signIn}>
              <Components.Title>WingIt</Components.Title>
              <Components.Paragraph>
                Đã có tài khoản? Đăng nhập tại đây.
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(true)}>
                Đăng Nhập
              </Components.GhostButton>
            </Components.LeftOverlayPanel>

            <Components.RightOverlayPanel $signIn={signIn}>
              <Components.Title>WingIt</Components.Title>
              <Components.Paragraph>
                Chưa có tài khoản? Đăng ký tài khoản mới tại đây.
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(false)}>
                Đăng Ký
              </Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>
    </div>
  );
}
