-- Migration: Add schedules column to jobpost table
-- Date: 2025-07-08
-- Purpose: Support interview schedules in job postings
-- Status: Applied manually via Python script (migrate_schedules.py)
-- 
-- This migration adds a TEXT column to store interview schedule information
-- as JSON format for job postings.

ALTER TABLE jobpost ADD COLUMN schedules TEXT;