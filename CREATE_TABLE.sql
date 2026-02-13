-- SQL Script to create Plates table in ebm_plateno database
-- Run this in SQL Server Management Studio

USE ebm_plateno;
GO

-- Drop table if exists (use with caution!)
-- DROP TABLE IF EXISTS Plates;
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

-- Verify table was created
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Plates'
ORDER BY ORDINAL_POSITION;
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

-- View all plates
SELECT * FROM Plates;
GO
