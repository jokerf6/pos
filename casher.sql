-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 11, 2025 at 11:33 PM
-- Server version: 10.6.22-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `casher`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `image`, `name`, `created_at`, `updated_at`) VALUES
(9, '/media/fahd/base2/frontend/pos/src/main/public/uploads/aaaaaaad/Group 43.png', 'aaaaaaad', '2025-07-11 22:27:16', '2025-07-11 22:27:16');

-- --------------------------------------------------------

--
-- Table structure for table `credit`
--

CREATE TABLE `credit` (
  `id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `reciever` text DEFAULT NULL,
  `daily_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit`
--

INSERT INTO `credit` (`id`, `reason`, `price`, `reciever`, `daily_id`, `created_at`) VALUES
(1, 'sss', '2.00', '', 8, '2025-07-19 15:47:59'),
(2, 'gg', '20.00', '', 4, '2025-07-19 15:48:58'),
(3, 'sss', '1.00', '', 8, '2025-08-08 01:54:17'),
(4, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(5, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(6, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(7, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(8, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(10, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(11, 'ss', '1.00', '', 8, '2025-08-08 01:55:22'),
(12, 'ss', '3.00', '', 8, '2025-08-08 01:55:22'),
(13, 'ss', '1.00', '', 24, '2025-08-09 03:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `daily`
--

CREATE TABLE `daily` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT curdate(),
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `userId` int(11) NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  `opened_at` datetime DEFAULT current_timestamp(),
  `openPrice` int(11) DEFAULT NULL,
  `closePrice` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily`
--

INSERT INTO `daily` (`id`, `date`, `note`, `created_at`, `userId`, `closed_at`, `opened_at`, `openPrice`, `closePrice`) VALUES
(3, '2025-07-19', NULL, '2025-07-19 15:40:57', 1, '2025-07-19 12:40:58', '2025-07-19 15:40:57', NULL, NULL),
(4, '2025-07-19', NULL, '2025-07-19 15:41:00', 1, '2025-07-24 23:23:48', '2025-07-19 15:41:00', NULL, 299),
(5, '2025-07-25', NULL, '2025-07-25 02:24:47', 1, '2025-07-24 23:26:05', '2025-07-25 02:24:47', 0, 299),
(6, '2025-07-25', NULL, '2025-07-25 02:26:12', 1, '2025-07-24 23:26:23', '2025-07-25 02:26:12', 4, 5),
(7, '2025-07-25', NULL, '2025-07-25 18:25:02', 1, '2025-07-25 15:25:15', '2025-07-25 18:25:02', 0, 0),
(8, '2025-07-25', NULL, '2025-07-25 18:25:21', 1, '2025-08-08 22:21:03', '2025-07-25 18:25:21', 0, 0),
(9, '2025-08-09', NULL, '2025-08-09 01:29:20', 1, '2025-08-08 22:30:09', '2025-08-09 01:29:20', 3, 0),
(10, '2025-08-09', NULL, '2025-08-09 01:30:16', 1, '2025-08-08 22:32:46', '2025-08-09 01:30:16', 0, 0),
(11, '2025-08-09', NULL, '2025-08-09 01:35:16', 1, '2025-08-08 22:36:07', '2025-08-09 01:35:16', 0, 0),
(12, '2025-08-09', NULL, '2025-08-09 01:37:32', 1, '2025-08-08 22:37:50', '2025-08-09 01:37:32', 0, 0),
(13, '2025-08-09', NULL, '2025-08-09 01:37:52', 1, '2025-08-08 22:37:59', '2025-08-09 01:37:52', 0, 0),
(14, '2025-08-09', NULL, '2025-08-09 01:38:22', 1, '2025-08-08 22:38:35', '2025-08-09 01:38:22', 0, 0),
(15, '2025-08-09', NULL, '2025-08-09 01:38:38', 1, '2025-08-08 22:39:41', '2025-08-09 01:38:38', 0, 0),
(16, '2025-08-09', NULL, '2025-08-09 01:40:18', 1, '2025-08-08 22:46:49', '2025-08-09 01:40:18', 0, 0),
(17, '2025-08-09', NULL, '2025-08-09 01:46:51', 1, '2025-08-08 22:46:58', '2025-08-09 01:46:51', 0, 0),
(18, '2025-08-09', NULL, '2025-08-09 01:47:00', 1, '2025-08-08 22:48:03', '2025-08-09 01:47:00', 0, 0),
(19, '2025-08-09', NULL, '2025-08-09 01:48:05', 1, '2025-08-08 22:48:32', '2025-08-09 01:48:05', 0, 0),
(20, '2025-08-09', NULL, '2025-08-09 01:48:34', 1, '2025-08-08 22:48:48', '2025-08-09 01:48:34', 0, 0),
(21, '2025-08-09', NULL, '2025-08-09 01:48:50', 1, '2025-08-08 22:49:09', '2025-08-09 01:48:50', 0, 0),
(22, '2025-08-09', NULL, '2025-08-09 01:49:11', 1, '2025-08-08 22:49:18', '2025-08-09 01:49:11', 0, 0),
(23, '2025-08-09', NULL, '2025-08-09 01:49:20', 1, '2025-08-08 22:54:44', '2025-08-09 01:49:20', 0, 0),
(24, '2025-08-09', NULL, '2025-08-09 02:35:25', 1, NULL, '2025-08-09 02:35:25', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoiceItems`
--

CREATE TABLE `invoiceItems` (
  `id` int(11) NOT NULL,
  `invoiceId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `pricePerUnit` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `discount` decimal(10,2) DEFAULT 0.00,
  `price` decimal(10,2) NOT NULL,
  `totalPriceAfterDiscount` decimal(10,2) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoiceItems`
--

INSERT INTO `invoiceItems` (`id`, `invoiceId`, `itemId`, `pricePerUnit`, `quantity`, `discount`, `price`, `totalPriceAfterDiscount`, `createdAt`) VALUES
(3, 3, 3, '10.00', 1, '0.00', '10.00', '10.00', '2025-07-24 19:23:15'),
(4, 4, 4, '10.00', 1, '0.00', '10.00', '10.00', '2025-07-24 19:39:21'),
(5, 5, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:39:48'),
(6, 6, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:41:42'),
(7, 7, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:42:51'),
(8, 8, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:43:03'),
(9, 9, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:43:13'),
(10, 10, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:46:36'),
(11, 11, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:49:42'),
(12, 12, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 19:50:09'),
(13, 13, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:10:31'),
(14, 14, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:12:25'),
(15, 15, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:13:00'),
(16, 16, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:13:07'),
(17, 17, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:13:16'),
(18, 18, 5, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:14:10'),
(19, 19, 6, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:15:37'),
(20, 20, 6, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:18:54'),
(21, 21, 6, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:20:09'),
(22, 22, 7, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:21:00'),
(23, 23, 8, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:22:31'),
(24, 24, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:23:09'),
(25, 25, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:23:19'),
(26, 26, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 20:23:32'),
(28, 28, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 23:33:58'),
(29, 29, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 23:35:01'),
(30, 30, 9, '1.00', 1, '0.00', '1.00', '1.00', '2025-07-24 23:43:35'),
(35, 34, 5, '20.00', 1, '0.00', '20.00', '20.00', '2025-07-25 18:26:51'),
(36, 35, 5, '20.00', 1, '0.00', '20.00', '20.00', '2025-07-25 18:26:51'),
(37, 36, 5, '20.00', 1, '0.00', '20.00', '20.00', '2025-08-07 22:53:55'),
(38, 37, 5, '20.00', 1, '0.00', '20.00', '20.00', '2025-08-07 22:55:28'),
(39, 38, 5, '20.00', 2, '0.00', '40.00', '40.00', '2025-08-07 22:56:06'),
(40, 39, 31, '0.00', 1, '0.00', '0.00', '0.00', '2025-08-09 01:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `customerName` varchar(255) DEFAULT NULL,
  `customerPhone` varchar(20) DEFAULT NULL,
  `paymentType` enum('خالص','أجل','مرتجع') NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `totalAfterDiscount` decimal(10,2) NOT NULL,
  `dailyId` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `customerName`, `customerPhone`, `paymentType`, `discount`, `total`, `totalAfterDiscount`, `dailyId`, `createdAt`) VALUES
(1, '', '', 'خالص', '0.00', '100.00', '100.00', 4, '2025-07-19 16:49:07'),
(2, '', '', 'خالص', '0.00', '100.00', '90.00', 4, '2025-07-19 16:49:07'),
(3, '', '', 'خالص', '0.00', '10.00', '10.00', 4, '2025-07-24 19:23:15'),
(4, '', '', 'خالص', '0.00', '10.00', '10.00', 4, '2025-07-24 19:39:21'),
(5, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 19:39:48'),
(6, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 19:41:42'),
(7, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 19:42:51'),
(8, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 19:43:03'),
(9, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 19:43:13'),
(10, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 19:46:36'),
(11, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 19:49:42'),
(12, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 19:50:09'),
(13, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 20:10:31'),
(14, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 20:12:25'),
(15, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:13:00'),
(16, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:13:07'),
(17, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:13:16'),
(18, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:14:10'),
(19, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 20:15:37'),
(20, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:18:54'),
(21, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:20:09'),
(22, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:21:00'),
(23, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:22:31'),
(24, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 20:23:09'),
(25, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 20:23:19'),
(26, '', '', 'مرتجع', '0.00', '1.00', '1.00', 4, '2025-07-24 20:23:32'),
(27, '', '', 'خالص', '0.00', '100.00', '100.00', 4, '2025-07-24 23:33:43'),
(28, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 23:33:58'),
(29, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 23:35:01'),
(30, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 23:43:35'),
(31, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-24 23:52:37'),
(32, '', '', 'خالص', '0.00', '2.00', '2.00', 4, '2025-07-24 23:56:53'),
(33, '', '', 'خالص', '0.00', '1.00', '1.00', 4, '2025-07-25 00:37:01'),
(34, '', '', 'خالص', '0.00', '20.00', '20.00', 8, '2025-07-25 18:26:51'),
(35, '', '', 'خالص', '0.00', '20.00', '20.00', 8, '2025-07-25 18:26:51'),
(36, '', '', 'خالص', '0.00', '20.00', '20.00', 8, '2025-08-07 22:53:55'),
(37, '', '', 'خالص', '0.00', '20.00', '20.00', 8, '2025-08-07 22:55:28'),
(38, '', '', 'خالص', '0.00', '40.00', '40.00', 8, '2025-08-07 22:56:05'),
(39, '', '', 'خالص', '0.00', '0.00', '0.00', 8, '2025-08-09 01:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `buy_price` float DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `barcode`, `price`, `stock`, `created_at`, `description`, `quantity`, `buy_price`, `category_id`) VALUES
(2, 'fahd', '100', '100.00', 0, '2025-07-19 15:46:21', 'sds', 6, 100, 9),
(3, 'ppp', '101', '10.00', 0, '2025-07-20 14:03:35', 'olll', 0, 10, 9),
(4, 'asa', '102', '10.00', 0, '2025-07-20 14:04:58', 'asas', 0, 10, 9),
(5, 'لانوس', '103', '20.00', 0, '2025-07-20 14:05:41', 'jkhjk', 0, 5, 9),
(6, 'ghg', '104', '1.00', 0, '2025-07-20 14:07:01', 'ghghg', 0, 1, 9),
(7, '111111', '105', '1.00', 0, '2025-07-20 14:12:07', 'سسس', 0, 1, 9),
(8, 'سسسس', '106', '1.00', 0, '2025-07-20 14:12:42', 'سشش', 0, 1, 9),
(9, 'سسسس', '107', '1.00', 0, '2025-07-20 14:14:35', 'سشش', 0, 1, 9),
(20, 'sdsd', '118', '1.00', 0, '2025-07-25 00:59:12', 'sdsd', 0, 2, 9),
(22, 'sdsd', '120', '1.00', 0, '2025-07-25 01:03:22', 'sdsd', 0, 1, 9),
(23, 'SDS', '121', '1.00', 0, '2025-07-25 01:04:21', 'ASDA', 0, 1, 9),
(24, 'final test', '122', '1.00', 0, '2025-08-08 20:38:40', 'ddd', 1, 1, 9),
(25, 'test2', '123', '10.00', 0, '2025-08-08 20:49:30', '222', 1, 10, 9),
(26, 'ffd', '124', '1.00', 0, '2025-08-08 20:50:39', 'dfd', 1, 1, 9),
(27, 'final', '125', '1.00', 0, '2025-08-09 00:55:02', 'sss', 1, 1, 9),
(28, 'final', '126', '1.00', 0, '2025-08-09 00:55:30', 'sss', 1, 1, 9),
(29, 'final2', '127', '2.00', 0, '2025-08-09 00:58:11', 'ssss', 1, 1, 9),
(30, 'final3', '128', '1.00', 0, '2025-08-09 00:59:01', 'sss', 1, 1, 9),
(31, 'final4', '129', '0.00', 0, '2025-08-09 01:00:03', 'sss', 1, 1, 9);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `category`, `created_at`, `updated_at`) VALUES
(1, 'sales.create', 'إنشاء مبيعات', 'إمكانية إنشاء فواتير مبيعات جديدة', 'sales', '2025-08-06 14:22:02', '2025-08-06 20:47:10'),
(2, 'sales.view', 'عرض المبيعات', 'إمكانية عرض فواتير المبيعات', 'sales', '2025-08-06 14:22:02', '2025-08-06 20:47:15'),
(6, 'inventory.view', 'عرض المخزون', 'إمكانية عرض المنتجات والمخزون', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:29'),
(7, 'inventory.create', 'إضافة منتجات', 'إمكانية إضافة منتجات جديدة', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:33'),
(8, 'inventory.edit', 'تعديل المنتجات', 'إمكانية تعديل بيانات المنتجات', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:35'),
(9, 'inventory.delete', 'حذف المنتجات', 'إمكانية حذف المنتجات', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:38'),
(15, 'users.view', 'عرض المستخدمين', 'إمكانية عرض قائمة المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:42'),
(16, 'users.create', 'إضافة مستخدمين', 'إمكانية إضافة مستخدمين جدد', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:49'),
(17, 'users.edit', 'تعديل المستخدمين', 'إمكانية تعديل بيانات المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:50'),
(18, 'users.delete', 'حذف المستخدمين', 'إمكانية حذف المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:52'),
(19, 'users.permissions', 'إدارة الصلاحيات', 'إمكانية تعديل صلاحيات المستخدمين', 'users', '2025-08-06 14:22:02', '2025-08-06 20:47:54'),
(23, 'cashier.open', 'فتح الكاشير', 'إمكانية فتح جلسة الكاشير', 'system', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(24, 'cashier.close', 'إغلاق الكاشير', 'إمكانية إغلاق جلسة الكاشير', 'system', '2025-08-06 14:22:02', '2025-08-06 20:48:04'),
(26, 'category.view', 'عرض الاقسام', 'إمكانية عرض كل الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(27, 'category.create', 'إضافة قسم', 'إمكانية إضافة قسم الي الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(28, 'category.delete', 'حذف قسم', 'إمكانية حذق قسم من الاقسام', 'category', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(30, 'credit.view', 'عرض المصروفات', 'إمكانية عرض كل المصروفات', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(31, 'credit.create', 'عمل مصروف', 'إمكانية عمل مصروف', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(32, 'credit.delete', 'حذف مصروف', 'إمكانية حذف مصروف من المصروفات', 'credit', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(33, 'settings.view', 'عرض الاعادات', 'إمكانيه عرض الاعدادات والتعديل عليها', 'settings', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(34, 'transaction.view', 'عرض الاحصائيات', 'إمكانيه عرض الاحصائيات', 'transaction', '2025-08-06 14:22:02', '2025-08-06 20:48:02'),
(35, 'inventory.statistics', 'احصائيات المنتجات', 'إمكانية عرض احصائيات المنتجات', 'products', '2025-08-06 14:22:02', '2025-08-06 20:47:38');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` enum('string','number','boolean') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `domain`, `key`, `value`, `name`, `type`) VALUES
(1, 'products', 'warning', '3', 'تحذير بنفاذ الكمية بعد', 'number'),
(2, 'daily', 'open', 'true', 'فتح اليومية بمبلغ مالي', 'boolean'),
(3, 'daily', 'closeWithSchudledInvoice', 'false', 'غلف اليومية بوجود فواتير أجل', 'boolean');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `transaction_type` enum('purchase','return','sale') NOT NULL COMMENT 'مشتريات, مرتجع, حركة بيع',
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_value` decimal(10,2) GENERATED ALWAYS AS (`quantity` * `unit_price`) STORED,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `item_id`, `transaction_type`, `quantity`, `unit_price`, `transaction_date`, `created_at`) VALUES
(1, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(2, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(3, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(4, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(5, 2, 'return', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(6, 2, 'sale', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(7, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(8, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(9, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(10, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(11, 2, 'purchase', 1, '1.00', '2025-08-08', '2025-08-08 20:23:27'),
(12, 31, 'purchase', 1, '0.00', '2025-08-08', '2025-08-08 22:00:03'),
(13, 31, 'purchase', 2, '0.00', '2025-08-08', '2025-08-08 22:00:47'),
(14, 31, 'sale', 1, '0.00', '2025-08-08', '2025-08-08 22:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','cashier') DEFAULT 'cashier',
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `active`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin', '$2b$13$KSbcudGO1E2HYTlL66WWmuAu7JrxtH5U3irVcTXwbuxsagok1PYw6', 'admin', 1, '2025-07-07 13:11:52', '2025-08-09 00:03:16', '2025-08-09 00:03:16'),
(35, 'test', '$2a$12$c3UiD8OPQBLfu5ttCmUTAuWFzJYKbgAof3Mh/uq6dujI2JL.GwX2a', 'cashier', 1, '2025-08-06 20:51:03', '2025-08-06 22:18:16', '2025-08-06 22:18:16'),
(36, 'admin2', '$2a$12$xzoZmXQ7g.YfhROhtvdcuOgZ27c1OTNF4yr8DTGpNrSjlLUk/7bPW', 'cashier', 1, '2025-08-06 22:19:46', '2025-08-09 00:03:07', '2025-08-09 00:03:07');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `granted_by` int(11) DEFAULT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `permission_id`, `granted_by`, `granted_at`) VALUES
(16, 35, 24, 1, '2025-08-06 21:10:05'),
(18, 35, 23, 1, '2025-08-06 21:10:05'),
(19, 35, 7, 1, '2025-08-06 21:10:05'),
(20, 35, 8, 1, '2025-08-06 21:10:05'),
(21, 35, 9, 1, '2025-08-06 21:10:05'),
(22, 35, 6, 1, '2025-08-06 21:10:05'),
(28, 36, 19, 1, '2025-08-08 23:34:43'),
(29, 36, 16, 1, '2025-08-08 23:34:43'),
(32, 36, 15, 1, '2025-08-08 23:34:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit`
--
ALTER TABLE `credit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dailyId` (`daily_id`);

--
-- Indexes for table `daily`
--
ALTER TABLE `daily`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_daily_user` (`userId`);

--
-- Indexes for table `invoiceItems`
--
ALTER TABLE `invoiceItems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoiceId` (`invoiceId`),
  ADD KEY `itemId` (`itemId`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dailyId` (`dailyId`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filename` (`filename`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`),
  ADD KEY `granted_by` (`granted_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `credit`
--
ALTER TABLE `credit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `daily`
--
ALTER TABLE `daily`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `invoiceItems`
--
ALTER TABLE `invoiceItems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `credit`
--
ALTER TABLE `credit`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`daily_id`) REFERENCES `daily` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `daily`
--
ALTER TABLE `daily`
  ADD CONSTRAINT `fk_daily_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoiceItems`
--
ALTER TABLE `invoiceItems`
  ADD CONSTRAINT `invoiceItems_ibfk_1` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoiceItems_ibfk_2` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`dailyId`) REFERENCES `daily` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_3` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
