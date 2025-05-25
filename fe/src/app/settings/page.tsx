"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider, Spinner } from "@nextui-org/react";
import { UserService } from "@/services";

interface UserSettings {
  // User profile data
  displayName: string;
  email: string;
  bio: string;
  
  // Preferences
  darkMode: boolean;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  privacyLevel: string;
  showOnlineStatus: boolean;
  allowSearchEngines: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    bio: '',
    darkMode: true,
    theme: 'default',
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
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

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await UserService.getCurrentUserProfile();
      
      setSettings(prev => ({
        ...prev,
        displayName: userData.displayName || '',
        email: userData.username || '', // Assuming username is email
        bio: userData.bio || '',
      }));
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Update profile information
      await UserService.updateUserProfile({
        displayName: settings.displayName,
        bio: settings.bio,
      });
      
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
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
      
      setSuccessMessage('Password changed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password.');
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
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
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
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Input 
                  label="Display Name"
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
              </div>
            </CardBody>
          </Card>
          
          {/* Appearance */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Appearance</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode on or off</p>
                </div>
                <Switch 
                  isSelected={settings.darkMode}
                  onValueChange={(value) => handleSettingChange('darkMode', value)}
                />
              </div>
              
              <div>
                <p className="font-medium mb-2">Theme</p>
                <Select 
                  label="Choose theme" 
                  selectedKeys={[settings.theme]}
                  onSelectionChange={(keys) => handleSettingChange('theme', Array.from(keys).join(""))}
                  className="max-w-xs"
                >
                  <SelectItem key="default" value="default">Default</SelectItem>
                  <SelectItem key="modern" value="modern">Modern</SelectItem>
                  <SelectItem key="classic" value="classic">Classic</SelectItem>
                  <SelectItem key="minimal" value="minimal">Minimal</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>
          
          {/* Notifications */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Notifications</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get email alerts</p>
                </div>
                <Switch 
                  isSelected={settings.emailNotifications}
                  onValueChange={(value) => handleSettingChange('emailNotifications', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get push notifications</p>
                </div>
                <Switch 
                  isSelected={settings.pushNotifications}
                  onValueChange={(value) => handleSettingChange('pushNotifications', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified for new messages</p>
                </div>
                <Switch 
                  isSelected={settings.messageNotifications}
                  onValueChange={(value) => handleSettingChange('messageNotifications', value)}
                />
              </div>
            </CardBody>
          </Card>
          
          {/* Privacy */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Privacy</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-medium mb-2">Who can see your profile</p>
                <Select 
                  label="Select privacy level" 
                  selectedKeys={[settings.privacyLevel]}
                  onSelectionChange={(keys) => handleSettingChange('privacyLevel', Array.from(keys).join(""))}
                  className="max-w-xs"
                >
                  <SelectItem key="public" value="public">Everyone</SelectItem>
                  <SelectItem key="friends" value="friends">Friends only</SelectItem>
                  <SelectItem key="private" value="private">Only me</SelectItem>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Show online status</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to see when you're online</p>
                </div>
                <Switch 
                  isSelected={settings.showOnlineStatus}
                  onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Allow search engines</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Let search engines index your profile</p>
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
              <h2 className="text-xl font-semibold">Account Security</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-medium mb-2">Change Password</p>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    label="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="Confirm new password"
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
                    Change Password
                  </Button>
                </div>
              </div>
              
              <Divider className="my-4" />
              
              <div>
                <p className="font-medium text-red-500">Danger Zone</p>
                <div className="flex gap-4 mt-2">
                  <Button color="danger" variant="flat">Deactivate Account</Button>
                  <Button color="danger">Delete Account</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="flat" onClick={fetchUserSettings}>Reset</Button>
          <Button 
            color="primary" 
            onClick={handleSaveSettings}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
