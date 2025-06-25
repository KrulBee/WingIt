-- Migration to rename allow_search_engines column to enable_notifications
-- This should be run AFTER deploying the new code that supports both field names

-- PostgreSQL migration script
-- Rename the column to better reflect its purpose
ALTER TABLE user_settings 
RENAME COLUMN allow_search_engines TO enable_notifications;

-- Verify the change
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_settings' AND column_name = 'enable_notifications';
