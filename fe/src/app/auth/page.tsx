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
            />
            <Components.Button disabled={loading}>
              {loading ? '🔄 Đang đăng ký...' : 'Đăng Ký'}
            </Components.Button>
          </Components.Form>
        </Components.SignUpContainer>        <Components.SignInContainer $signIn={signIn}>
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
            />
            <Components.Button style={{background:'#7700ff'}} disabled={loading}>
              {loading ? '🔄 Đang đăng nhập...' : 'Đăng Nhập'}
            </Components.Button>
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
