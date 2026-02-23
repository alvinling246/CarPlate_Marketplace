-- SQL Script to create Plates and Dealers tables in ebm_plateno database
-- Run this in SQL Server Management Studio

USE ebm_plateno;
GO

-- Drop tables if exists (use with caution!)
-- DROP TABLE IF EXISTS Plates;
-- DROP TABLE IF EXISTS Dealers;
-- GO

-- Create Plates table
CREATE TABLE Plates (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PlateNumber NVARCHAR(50) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    IsSold BIT NOT NULL DEFAULT 0,
    Category NVARCHAR(50) NULL,
    AddedDate DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Create Dealers table
CREATE TABLE Dealers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETDATE(),
    LastLoginDate DATETIME NULL
);
GO

-- Add indexes for better performance
CREATE INDEX IX_Dealers_Username ON Dealers (Username);
CREATE INDEX IX_Dealers_Email ON Dealers (Email);
CREATE INDEX IX_Dealers_IsActive ON Dealers (IsActive);
GO

-- Verify tables were created
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Plates', 'Dealers')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
GO

-- Insert sample data (optional)
INSERT INTO Plates (PlateNumber, Price, IsSold, Category, AddedDate)
VALUES 
    ('W 1', 350000, 0, 'GOLDEN NUMBER', GETDATE()),
    ('A 88', 280000, 0, '2 DIGIT', GETDATE()),
    ('WWW 1688', 128000, 0, '4 DIGIT', GETDATE()),
    ('AAA 888', 98000, 0, '3 DIGIT', GETDATE()),
    ('ABC 123', 15000, 0, 'CLASSIC', GETDATE());
GO

-- Insert sample dealer (optional - remove password hashing in production)
INSERT INTO Dealers (FullName, PhoneNumber, Email, Username, Password)
VALUES ('Test Dealer', '012-3456789', 'dealer@example.com', 'testdealer', 'hashed_password_here');
GO

-- View all data
SELECT * FROM Plates;
SELECT * FROM Dealers;
GO
