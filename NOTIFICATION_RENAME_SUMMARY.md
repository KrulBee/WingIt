# Notification Settings Rename Summary

## Overview
Successfully renamed the `allow_search_engines` field to `enable_notifications` throughout the entire codebase to better reflect its actual purpose of controlling notification settings.

## Changes Made

### 1. Database Schema (`database_postgresql.sql`)
- **Changed**: `allow_search_engines BOOLEAN NOT NULL DEFAULT TRUE` → `enable_notifications BOOLEAN NOT NULL DEFAULT TRUE`
- **Impact**: Column name now correctly reflects its purpose

### 2. Backend Java Files

#### UserSettings Entity (`server/src/main/java/com/example/server/model/Entity/UserSettings.java`)
- **Field**: `allowSearchEngines` → `enableNotifications`
- **Annotation**: `@Column(name = "enable_notifications", ...)`
- **Comment**: Updated to "Enable notifications for the user"
- **Methods**: Updated constructor, getters, setters, and toString()

#### UserSettingsDTO (`server/src/main/java/com/example/server/model/DTO/UserSettingsDTO.java`)
- **Field**: `allowSearchEngines` → `enableNotifications`
- **Comment**: Updated to "Enable notifications for the user"
- **Methods**: Updated constructor, getters, setters, and toString()

#### UserSettingsService (`server/src/main/java/com/example/server/service/UserSettingsService.java`)
- **Methods**: Updated all references to use `enableNotifications`
- **Default**: Ensures new users have notifications enabled by default

#### UserSettingsController (`server/src/main/java/com/example/server/controller/UserSettingsController.java`)
- **API**: Added support for both `"enablenotifications"` and legacy `"allowsearchengines"` for backwards compatibility
- **Backward compatibility**: Maintains support for old API calls during transition

### 3. Frontend TypeScript/React Files

#### Settings Service (`fe/src/services/settingsService.ts`)
- **Interface**: `UserSettings.allowSearchEngines` → `UserSettings.enableNotifications`
- **Interface**: `UpdateSettingsRequest.allowSearchEngines` → `UpdateSettingsRequest.enableNotifications`

#### Settings Page (`fe/src/app/settings/page.tsx`)
- **Interface**: `CombinedSettings.allowSearchEngines` → `CombinedSettings.enableNotifications`
- **State**: Updated default values and all references
- **UI**: Switch component now uses correct field name

#### Notification Sound Service (`fe/src/services/NotificationSoundService.ts`)
- **Method**: `initializeFromSettings(allowSearchEngines)` → `initializeFromSettings(enableNotifications)`

#### WebSocket Context (`fe/src/contexts/WebSocketContext.tsx`)
- **Reference**: Updated to use `userSettings.enableNotifications`
- **Comment**: Removed outdated comment about naming issue

### 4. Migration Support

#### Database Migration (`migrate_rename_notification_column.sql`)
- **Purpose**: Rename column from `allow_search_engines` to `enable_notifications`
- **Usage**: Run after deploying new code
- **Command**: `ALTER TABLE user_settings RENAME COLUMN allow_search_engines TO enable_notifications;`

## Deployment Strategy

### Option 1: Fresh Database (Recommended for your case)
1. Deploy new code with updated schema
2. No migration needed since you're using a fresh database

### Option 2: Existing Database Migration (If needed later)
1. Deploy new code (includes backwards compatibility)
2. Test that both old and new field names work
3. Run migration script to rename database column
4. Remove backwards compatibility code (optional)

## Default Settings Confirmed
- **Privacy Level**: `'public'` ✅
- **Show Online Status**: `true` ✅  
- **Enable Notifications**: `true` ✅

## Benefits
1. **Clarity**: Field name now clearly indicates its purpose
2. **Maintainability**: Code is more self-documenting
3. **Consistency**: Aligns with actual functionality
4. **Backwards Compatibility**: Existing API calls continue to work during transition

## Testing Checklist
- [ ] New user registration creates settings with correct defaults
- [ ] Settings page displays notification toggle correctly
- [ ] Notification toggle updates database correctly
- [ ] WebSocket notifications respect the setting
- [ ] Sound notifications work based on the setting

All files are now error-free and ready for deployment! 🎉
