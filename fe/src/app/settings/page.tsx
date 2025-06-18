"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Switch,   Input, 
  Select, 
  SelectItem, 
  Divider, 
  Spinner,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip
} from "@nextui-org/react";
import { UserService } from "@/services";
import settingsService, { UserSettings as DbUserSettings, UpdateSettingsRequest } from "@/services/settingsService";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { notificationSoundService } from "@/services/NotificationSoundService";
import {
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LockClosedIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  AtSymbolIcon
} from "@heroicons/react/24/outline";

interface UserProfile {
  id?: number;
  displayName: string;
  email: string;
  bio: string;
  profilePicture?: string;
  isOnline?: boolean;
  provider?: string;
}

interface CombinedSettings extends UserProfile {
  // Database-backed settings
  privacyLevel: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowSearchEngines: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
  const { updateNotificationSettings } = useWebSocket();const [settings, setSettings] = useState<CombinedSettings>({
    displayName: '',
    email: '',
    bio: '',
    profilePicture: '',
    provider: undefined,
    privacyLevel: 'friends',
    showOnlineStatus: true,
    allowSearchEngines: false,
  });
    const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
    const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

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
        dbSettings = await settingsService.getUserSettings(userData.id);      } catch (settingsError) {
        // If settings don't exist, they will be created with defaults
        console.log('Creating default settings for user');
        dbSettings = await settingsService.getUserSettings(userData.id);
      }

      // Combine profile and settings data
      setSettings({
        id: userData.id,
        displayName: userData.displayName || '',
        email: userData.username || '', // Assuming username is email
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || '',
        provider: userData.provider,
        privacyLevel: dbSettings.privacyLevel,
        showOnlineStatus: dbSettings.showOnlineStatus,
        allowSearchEngines: dbSettings.allowSearchEngines,
      });
      
      // Initialize notification settings
      updateNotificationSettings(dbSettings.allowSearchEngines);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };  const handleSettingChange = (key: keyof CombinedSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update notification settings immediately when the toggle changes
    if (key === 'allowSearchEngines') {
      updateNotificationSettings(value);
    }
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
      setError('Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');    } finally {
      setChangingPassword(false);
    }
  };
  const handleChangeEmail = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    if (emailForm.newEmail === settings.email) {
      setError('Email mới phải khác email hiện tại');
      return;
    }

    try {
      setChangingEmail(true);
      setError(null);
      setSuccessMessage(null);

      await UserService.requestEmailChange(emailForm.newEmail, emailForm.password);

      setEmailForm({
        newEmail: '',
        password: '',
      });

      setSuccessMessage('Đã gửi email xác nhận đến địa chỉ email mới. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác nhận để hoàn tất thay đổi.');

      // Clear success message after 10 seconds (longer since user needs to check email)
      setTimeout(() => setSuccessMessage(null), 10000);
    } catch (err) {
      console.error('Error requesting email change:', err);
      setError('Không thể gửi email xác nhận. Vui lòng kiểm tra mật khẩu và thử lại.');
    } finally {
      setChangingEmail(false);
    }
  };
  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'public': return <GlobeAltIcon className="w-4 h-4" />;
      case 'friends': return <UserGroupIcon className="w-4 h-4" />;
      case 'private': return <LockClosedIcon className="w-4 h-4" />;
      default: return <UserGroupIcon className="w-4 h-4" />;
    }
  };
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'XÓA TÀI KHOẢN') {
      setError('Vui lòng nhập chính xác "XÓA TÀI KHOẢN" để xác nhận');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await UserService.deleteCurrentUserAccount();

      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      alert('Tài khoản đã được xóa thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.');

      // Redirect to login page
      window.location.href = '/auth';

    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Không thể xóa tài khoản. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
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
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 p-6">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CogIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cài Đặt
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý thông tin cá nhân và tùy chọn riêng tư của bạn
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20">
            <CardBody className="flex flex-row items-center gap-3">
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardBody>
          </Card>
        )}
        
        {successMessage && (
          <Card className="mb-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
            <CardBody className="flex flex-row items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-600 dark:text-green-400">{successMessage}</p>
            </CardBody>
          </Card>
        )}

        {/* Settings Tabs */}
        <div className="w-full">
          <Tabs 
            aria-label="Tab cài đặt" 
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >            <Tab
              key="privacy"
              title={
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Riêng Tư</span>
                </div>
              }
            >
              {/* Privacy Tab Content */}
              <div className="py-6 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <EyeIcon className="w-5 h-5 text-primary" />
                      Hiển thị hồ sơ
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <Select
                      label="Ai có thể xem hồ sơ của bạn"
                      selectedKeys={[settings.privacyLevel]}
                      onSelectionChange={(keys) => handleSettingChange('privacyLevel', Array.from(keys).join(""))}
                      variant="bordered"
                      startContent={getPrivacyIcon(settings.privacyLevel)}
                    >
                      <SelectItem key="public" startContent={<GlobeAltIcon className="w-4 h-4" />}>
                        Công khai - Mọi người có thể xem
                      </SelectItem>
                      <SelectItem key="friends" startContent={<UserGroupIcon className="w-4 h-4" />}>
                        Bạn bè - Chỉ bạn bè có thể xem
                      </SelectItem>
                      <SelectItem key="private" startContent={<LockClosedIcon className="w-4 h-4" />}>
                        Riêng tư - Chỉ bạn có thể xem
                      </SelectItem>
                    </Select>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold">Tùy chọn hiển thị</h3>
                  </CardHeader>
                  <CardBody className="pt-0 space-y-4">                    <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </div>
                        <div>
                          <p className="font-medium">Trạng thái trực tuyến</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị khi bạn đang hoạt động trên nền tảng
                          </p>
                        </div>
                      </div>
                      <Switch
                        isSelected={settings.showOnlineStatus}
                        onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
                        color="success"
                      />
                    </div>                    <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <BellIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Âm thanh thông báo</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Phát âm thanh khi nhận thông báo mới
                          </p>
                        </div>
                      </div>                      <Switch
                        isSelected={settings.allowSearchEngines}
                        onValueChange={(value) => handleSettingChange('allowSearchEngines', value)}
                        color="primary"
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>            </Tab>

            <Tab
              key="security"
              title={
                <div className="flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5" />
                  <span>Bảo Mật</span>
                </div>
              }
            >              {/* Security Tab Content */}
              <div className="py-6 space-y-6">
                {/* Email Change Section */}
                <Card>                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AtSymbolIcon className="w-5 h-5 text-primary" />
                      Đổi email
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      <Input
                        type="email"
                        label="Email mới"
                        placeholder="Nhập email mới"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                        variant="bordered"
                        description="Email hiện tại sẽ được thay thế"
                      />
                      <Input
                        type="password"
                        label="Mật khẩu hiện tại"
                        placeholder="Nhập mật khẩu để xác nhận"
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                        variant="bordered"
                        description="Xác nhận mật khẩu để đổi email"
                      />
                      <Button
                        color="primary"
                        onClick={handleChangeEmail}
                        isLoading={changingEmail}
                        isDisabled={!emailForm.newEmail || !emailForm.password || emailForm.newEmail === settings.email}
                        className="w-fit"
                      >
                        Cập nhật email
                      </Button>
                    </div>
                  </CardBody>
                </Card>                {/* Password Change Section - Available for ALL users */}
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <KeyIcon className="w-5 h-5 text-primary" />
                      Đổi mật khẩu
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                      <Input
                        type="password"
                        label="Mật khẩu hiện tại"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        variant="bordered"
                      />
                      <Input
                        type="password"
                        label="Mật khẩu mới"
                        placeholder="Nhập mật khẩu mới"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        variant="bordered"
                        description="Ít nhất 6 ký tự"
                      />
                      <Input
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        placeholder="Nhập lại mật khẩu mới"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        variant="bordered"
                        color={passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? "danger" : "default"}
                        errorMessage={passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? "Mật khẩu không khớp" : ""}
                      />
                      <Button
                        color="primary"
                        onClick={handleChangePassword}
                        isLoading={changingPassword}
                        isDisabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                        className="w-fit"
                      >
                        Cập nhật mật khẩu
                      </Button>
                    </div>
                  </CardBody>
                </Card>                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      Vùng nguy hiểm
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Vô hiệu hóa tài khoản</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                          Tạm thời ẩn tài khoản của bạn khỏi những người dùng khác. Bạn có thể kích hoạt lại bất cứ lúc nào.
                        </p>
                        <Button color="danger" variant="flat" onPress={onDeactivateOpen}>
                          Vô hiệu hóa tài khoản
                        </Button>
                      </div>

                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Xóa tài khoản</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                          Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                        </p>
                        <Button color="danger" onPress={onDeleteOpen}>
                          Xóa tài khoản vĩnh viễn
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="flat" onClick={fetchUserSettings}>
            Đặt lại
          </Button>
          <Button
            color="primary"
            onClick={handleSaveSettings}
            isLoading={saving}
            size="lg"
          >
            Lưu thay đổi
          </Button>
        </div>

        {/* Delete Account Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-red-600">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Xác nhận xóa tài khoản
              </div>
            </ModalHeader>
            <ModalBody>
              <p>Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của mình?</p>
              <p className="text-sm text-gray-500">
                Hành động này sẽ xóa tất cả dữ liệu của bạn và không thể hoàn tác.
              </p>
              <Input
                label="Để xác nhận, hãy nhập 'XÓA TÀI KHOẢN'"
                placeholder="XÓA TÀI KHOẢN"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                variant="bordered"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onDeleteClose}>
                Hủy
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteAccount}
                isLoading={deleting}
                isDisabled={deleteConfirmText !== 'XÓA TÀI KHOẢN'}
              >
                Xóa tài khoản
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Deactivate Account Modal */}
        <Modal isOpen={isDeactivateOpen} onClose={onDeactivateClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-orange-600">
                <EyeSlashIcon className="w-6 h-6" />
                Xác nhận vô hiệu hóa tài khoản
              </div>
            </ModalHeader>
            <ModalBody>
              <p>Bạn có chắc chắn muốn vô hiệu hóa tài khoản của mình?</p>
              <p className="text-sm text-gray-500">
                Tài khoản của bạn sẽ bị ẩn khỏi những người dùng khác, nhưng bạn có thể kích hoạt lại bất cứ lúc nào.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onDeactivateClose}>
                Hủy
              </Button>
              <Button color="warning" onPress={onDeactivateClose}>
                Vô hiệu hóa
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        </div>
      </main>
    </div>
  );
}
