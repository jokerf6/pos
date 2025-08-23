-- Migration script to fix units handling in products
-- This script creates the units table and updates the items table to include unit_id

-- Create units table
CREATE TABLE IF NOT EXISTS `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `abbreviation` varchar(10) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_default_unit` (`is_default`) -- Ensures only one default unit
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default units
INSERT INTO `units` (`name`, `abbreviation`, `is_default`) VALUES 
('قطعة', 'قطعة', 1),
('كيلو', 'كجم', 0),
('جرام', 'جم', 0),
('لتر', 'لتر', 0),
('متر', 'م', 0),
('علبة', 'علبة', 0),
('كرتونة', 'كرتونة', 0);

-- Add unit_id column to items table
ALTER TABLE `items` ADD COLUMN `unit_id` int(11) DEFAULT 1 AFTER `category_id`;

-- Add foreign key constraint
ALTER TABLE `items` ADD CONSTRAINT `fk_items_unit` 
FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

-- Update existing items to use default unit
UPDATE `items` SET `unit_id` = 1 WHERE `unit_id` IS NULL;

