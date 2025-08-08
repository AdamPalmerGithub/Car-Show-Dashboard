# Car Show Database Schema and Seed Data

```sql
DROP DATABASE IF EXISTS car_show;
CREATE DATABASE car_show;
USE car_show;

-- Create Owner table
CREATE TABLE `owner` (
    `owner_id` int PRIMARY KEY AUTO_INCREMENT,
    `owner_first_name` varchar(30) NOT NULL,
    `owner_last_name` varchar(30) NOT NULL,
    `owner_email` varchar(100) NOT NULL UNIQUE,
    `owner_phone` varchar(15) NOT NULL
);

-- Create Car table with FK to Owner
CREATE TABLE `car` (
    `car_id` int PRIMARY KEY AUTO_INCREMENT,
    `car_brand` varchar(100) NOT NULL,
    `car_model` varchar(100) NOT NULL,
    `car_year` date DEFAULT NULL,
    `car_reg` varchar(10) NOT NULL,
    `owner_id` int,
        FOREIGN KEY (owner_id) 
            REFERENCES owner(owner_id)
);

-- Create Show Ground table with county instead of town
CREATE TABLE `show_ground` (
    `show_ground_id` int PRIMARY KEY AUTO_INCREMENT,
    `show_name` varchar(50) NOT NULL,
    `show_country` varchar(30),
    `show_county` varchar(30),
    `show_postcode` varchar(10) NOT NULL,
    `show_date` date NOT NULL,
    `show_description` text
);

-- Create bridging table for many-to-many relationship
CREATE TABLE `car_at_show` (
    `car_id` int,
    `show_ground_id` int,
    PRIMARY KEY (`car_id`, `show_ground_id`),
    FOREIGN KEY (car_id) REFERENCES car (car_id),
    FOREIGN KEY (show_ground_id) REFERENCES show_ground (show_ground_id)
);

-- Insert Owners
INSERT INTO `owner` (`owner_id`, `owner_first_name`, `owner_last_name`, `owner_email`, `owner_phone`) VALUES
    (101, 'Ian', 'Mackleroy', 'im@email.com', '77889334455'),
    (102, 'Jonathan', 'Ferguson', 'jf@email.com', '12345667788'),
    (103, 'Tony', 'Hawk', 'th@example.com', '12345654321'),
    (104, 'Sarah', 'Connor', 'sc@example.com', '98765432100');

-- Insert Cars
INSERT INTO `car` (`car_id`, `car_brand`, `car_model`, `car_year`, `car_reg`, `owner_id`) VALUES 
    (101, 'Ford', 'Fiesta', '1980-01-01', 'BD51 SMR' 101),
    (102, 'Volvo', '240', '1991-01-01', 'TE44 ANT', 102),
    (103, 'Lada', 'Riva', '1992-01-01', 'PR05 PER', 103),
    (104, 'Ford', 'Transit', '1968-01-01', 'BP99 NPC', 104);

-- Insert Show Grounds (using county names)
INSERT INTO `show_ground` (`show_ground_id`, `show_name`, `show_country`, `show_county`, `show_postcode`, `show_date`, `show_description`) VALUES
    (1, 'Nuts n Bolts', 'UK', 'South Glamorgan', 'AS11DF', '2025-08-10', 'A fun and family-friendly car show featuring custom builds, hot rods, and classic restorations.'),
    (2, 'Retro Rides Rally', 'UK', 'Somerset', 'BR44TY', '2025-09-04', 'Join enthusiasts from across the UK for a vibrant celebration of retro rides, vintage vehicles, and 80s vibes.'),
    (3, 'Classic Car Carnival', 'UK', 'Greater Manchester', 'MN22CC', '2025-10-15', 'A massive carnival-style car show with food stalls, live music, and hundreds of classic cars on display.'),
    (4, 'Torque Fest', 'UK', 'West Yorkshire', 'LS16AB', '2025-07-20', 'An adrenaline-packed show focused on performance vehicles, supercars, and modified machines.'),
    (5, 'Heritage Wheels Expo', 'UK', 'Oxfordshire', 'OX10CD', '2025-11-02', 'A celebration of automotive history, showcasing rare vintage models and restored classics from across Europe.'),
    (6, 'Winter Chrome Show', 'UK', 'Kent', 'KT55EF', '2025-12-06', 'A festive indoor car show featuring chrome-drenched classics, custom builds, and seasonal entertainment.');


-- Insert Car Appearances at Shows
INSERT INTO `car_at_show` (`car_id`, `show_ground_id`) VALUES
    (101, 1),
    (102, 1),
    (103, 1),
    (104, 1),
    (101, 2),
    (103, 2),
    (104, 2),
    (102, 3);
