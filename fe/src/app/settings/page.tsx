"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Spinner } from "@nextui-org/react";
import { UserService } from "@/services";
import settingsService, { UserSettings as DbUserSettings, UpdateSettingsRequest } from "@/services/settingsService";

interface UserProfile {
  displayName: string;
  email: string;
  bio: string;
}

interface CombinedSettings extends UserProfile {
  // Database-backed settings
  privacyLevel: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowSearchEngines: boolean;
}

export default function SettingsPage() {  const [settings, setSettings] = useState<CombinedSettings>({
    displayName: '',
    email: '',
    bio: '',
    privacyLevel: 'friends',
    showOnlineStatus: true,
    allowSearchEngines: false,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);
  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile data
      const userData = await UserService.getCurrentUserProfile();
      setCurrentUserId(userData.id);
      
      // Fetch database-backed settings
      let dbSettings: DbUserSettings;
      try {
        dbSettings = await settingsService.getUserSettings(userData.id);
      } catch (settingsError) {
        // If settings don't exist, they will be created with defaults
        console.log('Creating default settings for user');
        dbSettings = await settingsService.getUserSettings(userData.id);
      }
        // Combine profile and settings data
      setSettings({
        displayName: userData.displayName || '',
        email: userData.username || '', // Assuming username is email
        bio: userData.bio || '',
        privacyLevel: dbSettings.privacyLevel,
        showOnlineStatus: dbSettings.showOnlineStatus,
        allowSearchEngines: dbSettings.allowSearchEngines,
      });
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };
  const handleSettingChange = (key: keyof CombinedSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSaveSettings = async () => {
    if (!currentUserId) {
      setError('Không thể xác định người dùng');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Update profile information
      await UserService.updateUserProfile({
        displayName: settings.displayName,
        bio: settings.bio,
      });
        // Update database-backed settings
      const settingsUpdate: UpdateSettingsRequest = {
        privacyLevel: settings.privacyLevel,
        showOnlineStatus: settings.showOnlineStatus,
        allowSearchEngines: settings.allowSearchEngines,
      };
      
      await settingsService.updateUserSettings(currentUserId, settingsUpdate);
      
      // Notify other components (like Sidebar) that profile was updated
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      setSuccessMessage('Đã lưu cài đặt thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setChangingPassword(true);
      setError(null);
      setSuccessMessage(null);
      
      await UserService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccessMessage('Đã đổi mật khẩu thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-6">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </main>
      </div>
    );
  }
    return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Cài Đặt</h1>
        
        {/* Error Message */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardBody>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardBody>
          </Card>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <Card className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardBody>
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
            </CardBody>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="w-full">            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Thông Tin Hồ Sơ</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>                <Input 
                  label="Tên Hiển Thị"
                  value={settings.displayName}
                  onChange={(e) => handleSettingChange('displayName', e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div>
                <Input 
                  label="Email"
                  type="email" 
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="max-w-xs"
                  isDisabled // Email changes typically require verification
                />
              </div>
              
              <div>
                <Input 
                  label="Bio"
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  className="max-w-xs"
                />
              </div>            </CardBody>
          </Card>
          
          {/* Privacy */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Riêng Tư</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-medium mb-2">Ai có thể xem hồ sơ của bạn</p>
                <Select 
                  label="Chọn mức độ riêng tư" 
                  selectedKeys={[settings.privacyLevel]}
                  onSelectionChange={(keys) => handleSettingChange('privacyLevel', Array.from(keys).join(""))}
                  className="max-w-xs"
                >
                  <SelectItem key="public" value="public">Mọi người</SelectItem>
                  <SelectItem key="friends" value="friends">Chỉ bạn bè</SelectItem>
                  <SelectItem key="private" value="private">Chỉ tôi</SelectItem>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Hiển thị trạng thái trực tuyến</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cho phép người khác biết khi bạn đang trực tuyến</p>
                </div>
                <Switch 
                  isSelected={settings.showOnlineStatus}
                  onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Cho phép công cụ tìm kiếm</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Để công cụ tìm kiếm lập chỉ mục hồ sơ của bạn</p>
                </div>
                <Switch 
                  isSelected={settings.allowSearchEngines}
                  onValueChange={(value) => handleSettingChange('allowSearchEngines', value)}
                />
              </div>
            </CardBody>
          </Card>
            {/* Account Security */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Bảo Mật Tài Khoản</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-medium mb-2">Đổi Mật Khẩu</p>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    label="Mật khẩu hiện tại"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="Mật khẩu mới"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="Xác nhận mật khẩu mới"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="max-w-xs"
                  />
                  <Button 
                    color="primary" 
                    size="sm"
                    onClick={handleChangePassword}
                    isLoading={changingPassword}
                    isDisabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    Đổi Mật Khẩu
                  </Button>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              <div>
                <p className="font-medium text-red-500">Vùng Nguy Hiểm</p>
                <div className="flex gap-4 mt-2">
                  <Button color="danger" variant="flat">Vô Hiệu Hóa Tài Khoản</Button>
                  <Button color="danger">Xóa Tài Khoản</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
          <div className="mt-6 flex justify-end gap-2">
          <Button variant="flat" onClick={fetchUserSettings}>Đặt Lại</Button>
          <Button 
            color="primary" 
            onClick={handleSaveSettings}
            isLoading={saving}
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </main>
    </div>
  );
}
