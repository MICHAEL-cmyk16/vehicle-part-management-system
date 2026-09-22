CREATE DATABASE IF NOT EXISTS vehicle_part_management;
USE vehicle_part_management;

DROP TABLE IF EXISTS repair_reports;
DROP TABLE IF EXISTS maintenance;
DROP TABLE IF EXISTS manuals;
DROP TABLE IF EXISTS cad_models;
DROP TABLE IF EXISTS qr_codes;
DROP TABLE IF EXISTS vehicle_parts;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','MECHANIC','OWNER') NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    year INT NOT NULL,
    vin VARCHAR(80) UNIQUE,
    color VARCHAR(50),
    owner_id INT,
    image_url VARCHAR(500),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE parts (
    part_id INT PRIMARY KEY AUTO_INCREMENT,
    part_number VARCHAR(80) UNIQUE NOT NULL,
    part_name VARCHAR(120) NOT NULL,
    category VARCHAR(80),
    description TEXT,
    manufacturer VARCHAR(120)
);

CREATE TABLE vehicle_parts (
    vehicle_part_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    part_id INT NOT NULL,
    position_label VARCHAR(100),
    installed_on DATE,
    status ENUM('ACTIVE','REPLACED','INSPECTION') DEFAULT 'ACTIVE',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
);

CREATE TABLE qr_codes (
    qr_id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL,
    qr_value VARCHAR(255) UNIQUE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
);

CREATE TABLE manuals (
    manual_id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url VARCHAR(500),
    version VARCHAR(50),
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
);

CREATE TABLE cad_models (
    cad_id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    model_type ENUM('3D','EXPLODED_VIEW','SCHEMATIC') DEFAULT '3D',
    model_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    description TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
);

CREATE TABLE repair_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_part_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    repair_date DATE NOT NULL,
    problem TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    remarks TEXT,
    cost DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (vehicle_part_id) REFERENCES vehicle_parts(vehicle_part_id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE maintenance (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('UPCOMING','COMPLETED','OVERDUE') DEFAULT 'UPCOMING',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

INSERT INTO users (name,email,password,role,phone) VALUES
('System Administrator','admin@autopart.local','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','ADMIN','9000000001'),
('Arjun Kumar','mechanic@autopart.local','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','MECHANIC','9000000002'),
('Rahul Sharma','owner@autopart.local','owner123','OWNER','9000000003'),
('Priya Mehta','priya@autopart.local','OWNER','OWNER','9000000004');

INSERT INTO vehicles (registration_no,brand,model,year,vin,color,owner_id,image_url) VALUES
('AP 35 AB 1024','Tata','Nexon',2024,'TATANEXON2024VIN001','Atlas Black',3,'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'),
('TS 09 CD 7788','Hyundai','Creta',2023,'HYDCRETA2023VIN002','Titan Grey',4,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80'),
('AP 39 EF 5512','Mahindra','Thar',2024,'MHTHAR2024VIN003','Red Rage',3,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80');

INSERT INTO parts (part_number,part_name,category,description,manufacturer) VALUES
('TNX-BRK-001','Front Brake Disc','Braking','Ventilated front brake disc assembly.','Tata Motors'),
('TNX-OIL-014','Engine Oil Filter','Engine','Spin-on oil filter for scheduled service.','Tata Motors'),
('CRT-AIR-009','Air Filter','Engine','High-flow engine air filtration element.','Hyundai'),
('THR-SUS-021','Front Suspension Strut','Suspension','Front strut assembly for the Thar platform.','Mahindra'),
('TNX-BAT-005','12V Battery','Electrical','12V starting battery assembly.','Exide');

INSERT INTO vehicle_parts (vehicle_id,part_id,position_label,installed_on,status) VALUES
(1,1,'Front Left / Right','2024-02-10','ACTIVE'),
(1,2,'Engine Bay','2024-02-10','ACTIVE'),
(2,3,'Engine Bay','2023-08-12','ACTIVE'),
(3,4,'Front Suspension','2024-03-05','ACTIVE'),
(1,5,'Engine Bay','2024-02-10','ACTIVE');

INSERT INTO qr_codes (part_id,qr_value) VALUES
(1,'PART-TNX-BRK-001'),
(2,'PART-TNX-OIL-014'),
(3,'PART-CRT-AIR-009'),
(4,'PART-THR-SUS-021'),
(5,'PART-TNX-BAT-005');

INSERT INTO manuals (part_id,title,file_url,version) VALUES
(1,'Front Brake Disc Service Manual','#','v2.1'),
(2,'Engine Oil Filter Replacement Guide','#','v1.4'),
(3,'Air Filter Inspection & Replacement','#','v3.0'),
(4,'Front Suspension Strut Workshop Manual','#','v2.2'),
(5,'12V Battery Inspection Manual','#','v1.8');

INSERT INTO cad_models (part_id,title,model_type,model_url,description) VALUES
(1,'Front Brake Assembly CAD','3D','#','Interactive demonstration model of a brake disc and caliper assembly.'),
(1,'Brake Exploded View','EXPLODED_VIEW','#','Exploded reference showing disc, caliper, hub and fasteners.'),
(2,'Oil Filter CAD','3D','#','Simplified 3D reference model for the oil filter.'),
(3,'Air Filter Housing CAD','3D','#','Simplified air filter housing reference.'),
(4,'Front Suspension CAD','3D','#','Simplified strut and spring assembly reference.'),
(5,'12V Battery CAD','3D','#','Simplified automotive battery reference.');

INSERT INTO repair_reports (vehicle_part_id,mechanic_id,repair_date,problem,action_taken,remarks,cost) VALUES
(1,2,'2026-08-12','Brake vibration during braking','Inspected disc and cleaned mating surface','Monitor for repeat vibration.',850.00),
(2,2,'2026-08-22','Scheduled oil service','Replaced oil filter and engine oil','Next service recommended at 10,000 km.',1200.00),
(3,2,'2026-09-03','Reduced engine airflow','Removed and replaced air filter','Filter condition restored.',650.00),
(4,2,'2026-09-10','Front-end noise','Inspected strut mount and tightened assembly','No further abnormal noise observed.',500.00);

INSERT INTO maintenance (vehicle_id,title,due_date,status) VALUES
(1,'Engine Oil & Filter Service','2026-10-15','UPCOMING'),
(1,'Brake Inspection','2026-11-02','UPCOMING'),
(2,'Air Filter Inspection','2026-10-08','UPCOMING'),
(3,'Suspension Inspection','2026-12-10','UPCOMING');
