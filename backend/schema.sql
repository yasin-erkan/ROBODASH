-- RoboDash database setup (fresh install + existing DB upgrade)
CREATE DATABASE IF NOT EXISTS robodash;
USE robodash;

CREATE TABLE IF NOT EXISTS robots (
  robot_id VARCHAR(20) PRIMARY KEY,
  country VARCHAR(2) NOT NULL,
  site VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry_data (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  robot_id VARCHAR(50) NOT NULL,
  country VARCHAR(2) NULL,
  site VARCHAR(100) NULL,
  battery_level DECIMAL(5, 2) NOT NULL,
  water_level DECIMAL(5, 2) NOT NULL DEFAULT 100,
  panels_cleaned INT NOT NULL DEFAULT 0,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'idle',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_telemetry_robot (robot_id),
  INDEX idx_telemetry_created (created_at)
);

CREATE TABLE IF NOT EXISTS system_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('info', 'warn', 'error') NOT NULL DEFAULT 'info',
  source ENUM('server', 'dashboard', 'robot', 'database') NOT NULL DEFAULT 'server',
  robot_id VARCHAR(20) NULL,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_level (level),
  INDEX idx_logs_robot (robot_id),
  INDEX idx_logs_created (created_at)
);

-- Add missing columns on older telemetry_data tables (safe to re-run)
SET @db := DATABASE();

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'telemetry_data' AND COLUMN_NAME = 'country') = 0,
  'ALTER TABLE telemetry_data ADD COLUMN country VARCHAR(2) NULL AFTER robot_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'telemetry_data' AND COLUMN_NAME = 'site') = 0,
  'ALTER TABLE telemetry_data ADD COLUMN site VARCHAR(100) NULL AFTER country',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'telemetry_data' AND COLUMN_NAME = 'water_level') = 0,
  'ALTER TABLE telemetry_data ADD COLUMN water_level DECIMAL(5, 2) NOT NULL DEFAULT 100 AFTER battery_level',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'telemetry_data' AND COLUMN_NAME = 'panels_cleaned') = 0,
  'ALTER TABLE telemetry_data ADD COLUMN panels_cleaned INT NOT NULL DEFAULT 0 AFTER water_level',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO robots (robot_id, country, site, latitude, longitude) VALUES
  ('RB-101', 'LU', 'Luxembourg HQ', 49.611600, 6.131900),
  ('RB-102', 'DE', 'Munich Solar Park', 48.135100, 11.582000),
  ('RB-103', 'FR', 'Lyon Solar Farm', 45.764000, 4.835700),
  ('RB-104', 'ES', 'Seville Plant', 37.389100, -5.984500),
  ('RB-105', 'IT', 'Milan Installation', 45.464200, 9.190000),
  ('RB-106', 'NL', 'Rotterdam Site', 51.924400, 4.477700),
  ('RB-107', 'BE', 'Brussels Array', 50.850300, 4.351700),
  ('RB-108', 'AT', 'Vienna Field', 48.208200, 16.373800),
  ('RB-109', 'PL', 'Warsaw Farm', 52.229700, 21.012200),
  ('RB-110', 'PT', 'Lisbon Plant', 38.722300, -9.139300)
ON DUPLICATE KEY UPDATE
  country = VALUES(country),
  site = VALUES(site),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude);
