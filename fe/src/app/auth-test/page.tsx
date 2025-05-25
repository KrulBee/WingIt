"use client";

import React, { useEffect, useState } from 'react';
import AuthService from '../../services/AuthService';

interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

export default function AuthTestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('🧪 AUTH TEST PAGE LOADED');
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    console.log('🔍 Checking authentication status...');
    
    try {
      // Check localStorage for token
      const storedToken = localStorage.getItem('auth-token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🗄️ Token in localStorage:', storedToken ? storedToken.substring(0, 20) + '...' : 'None');
      console.log('🗄️ User in localStorage:', storedUser ? JSON.parse(storedUser) : 'None');
      
      setToken(storedToken);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (storedToken) {
        console.log('🔐 Token found, validating with server...');
        
        // Validate token with server
        const currentUser = await AuthService.getCurrentUser();
        console.log('✅ Server validation successful:', currentUser);
        
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        console.log('❌ No token found');
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('❌ Authentication check failed:', error);
      setError(error.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    try {
      await AuthService.logout();
      console.log('✅ Logout successful');
      
      // Clear local state
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setError('');
      
      console.log('🧹 Local state cleared');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      setError(error.message);
    }
  };
  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🔄 Trang Kiểm Tra Xác Thực</h1>
        <p>Đang tải trạng thái xác thực...</p>
      </div>
    );
  }

  return (    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🧪 Trang Kiểm Tra Xác Thực</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Trạng Thái Xác Thực</h2>
        <p><strong>Đã xác thực:</strong> <span style={{ color: isAuthenticated ? 'green' : 'red' }}>
          {isAuthenticated ? '✅ CÓ' : '❌ KHÔNG'}
        </span></p>
        
        {error && (
          <p><strong>Lỗi:</strong> <span style={{ color: 'red' }}>{error}</span></p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Thông Tin Token</h2>
        <p><strong>Token:</strong> {token ? token.substring(0, 50) + '...' : 'Không có'}</p>
        <p><strong>Độ dài Token:</strong> {token ? token.length : 0}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Thông Tin Người Dùng</h2>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Tên đăng nhập:</strong> {user.username}</p>
            <p><strong>Tên hiển thị:</strong> {user.displayName || 'Chưa thiết lập'}</p>
            <p><strong>Tiểu sử:</strong> {user.bio || 'Chưa thiết lập'}</p>
            <p><strong>Ảnh đại diện:</strong> {user.profilePicture || 'Chưa thiết lập'}</p>
            <p><strong>Ngày sinh:</strong> {user.dateOfBirth || 'Chưa thiết lập'}</p>
          </div>
        ) : (
          <p>Không có dữ liệu người dùng</p>
        )}
      </div>      <div style={{ marginBottom: '20px' }}>
        <h2>Hành Động</h2>
        <button 
          onClick={checkAuthentication}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Làm Mới Trạng Thái Xác Thực
        </button>
        
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 Đăng Xuất
          </button>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>🛠️ Hướng Dẫn Kiểm Tra</h3>
        <ol>
          <li>Đi tới <a href="/auth">/auth</a> để đăng nhập</li>
          <li>Kiểm tra console trình duyệt để xem log chi tiết</li>
          <li>Quay lại trang này để xem trạng thái xác thực</li>
          <li>Sử dụng "Làm Mới Trạng Thái Xác Thực" để kiểm tra kết nối server</li>
          <li>Sử dụng "Đăng Xuất" để kiểm tra chức năng đăng xuất</li>
        </ol>
      </div>
    </div>
  );
}
