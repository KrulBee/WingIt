"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, CardHeader, Button, Switch, Input, Select, SelectItem, Divider } from "@nextui-org/react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState("friends");
  
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  isSelected={darkMode}
                  onValueChange={setDarkMode}
                />
              </div>
              
              <div>
                <p className="font-medium mb-2">Theme</p>
                <Select 
                  label="Choose theme" 
                  defaultSelectedKeys={["default"]}
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
                  isSelected={emailNotifications}
                  onValueChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get push notifications</p>
                </div>
                <Switch 
                  isSelected={pushNotifications}
                  onValueChange={setPushNotifications}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified for new messages</p>
                </div>
                <Switch 
                  isSelected={messageNotifications}
                  onValueChange={setMessageNotifications}
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
                  defaultSelectedKeys={[privacyLevel]}
                  onSelectionChange={(keys) => setPrivacyLevel(Array.from(keys).join(""))}
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
                <Switch defaultSelected />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Allow search engines</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Let search engines index your profile</p>
                </div>
                <Switch />
              </div>
            </CardBody>
          </Card>
          
          {/* Account */}
          <Card className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Account</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-medium mb-2">Email</p>
                <Input 
                  type="email" 
                  label="Email address"
                  defaultValue="user@example.com"
                  className="max-w-xs"
                />
              </div>
              
              <div>
                <p className="font-medium mb-2">Change Password</p>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    label="Current password"
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="New password"
                    className="max-w-xs"
                  />
                  <Input 
                    type="password" 
                    label="Confirm new password"
                    className="max-w-xs"
                  />
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
          <Button variant="flat">Cancel</Button>
          <Button color="primary">Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
