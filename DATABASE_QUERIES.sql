-- SQL Server Management Studio Queries
-- Database: ebm_plateno

-- ============================================
-- 1. CONNECT TO DATABASE
-- ============================================
-- In SSMS, select the database from the dropdown:
USE ebm_plateno;
GO

-- ============================================
-- 2. CHECK IF TABLES EXIST
-- ============================================
-- View all tables in the database
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- ============================================
-- 3. CHECK IF Plates TABLE EXISTS
-- ============================================
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_NAME = 'Plates')
    PRINT 'Plates table exists!'
ELSE
    PRINT 'Plates table does NOT exist. Run migrations first.';
GO

-- ============================================
-- 4. VIEW TABLE STRUCTURE
-- ============================================
-- View columns and data types of Plates table
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Plates'
ORDER BY ORDINAL_POSITION;
GO

-- ============================================
-- 5. VIEW ALL PLATES DATA
-- ============================================
SELECT 
    Id,
    PlateNumber,
    Price,
    IsSold,
    Category,
    AddedDate
FROM Plates
ORDER BY AddedDate DESC;
GO

-- ============================================
-- 6. COUNT PLATES
-- ============================================
SELECT 
    COUNT(*) AS TotalPlates,
    SUM(CASE WHEN IsSold = 0 THEN 1 ELSE 0 END) AS AvailablePlates,
    SUM(CASE WHEN IsSold = 1 THEN 1 ELSE 0 END) AS SoldPlates
FROM Plates;
GO

-- ============================================
-- 7. VIEW PLATES BY CATEGORY
-- ============================================
SELECT 
    Category,
    COUNT(*) AS Count,
    AVG(Price) AS AveragePrice,
    MIN(Price) AS MinPrice,
    MAX(Price) AS MaxPrice
FROM Plates
WHERE IsSold = 0
GROUP BY Category
ORDER BY Count DESC;
GO

-- ============================================
-- 8. SEARCH PLATES BY NUMBER
-- ============================================
-- Replace '88' with your search term
SELECT * 
FROM Plates
WHERE PlateNumber LIKE '%88%'
ORDER BY Price DESC;
GO

-- ============================================
-- 9. VIEW AVAILABLE PLATES ONLY
-- ============================================
SELECT 
    Id,
    PlateNumber,
    Price,
    Category,
    AddedDate
FROM Plates
WHERE IsSold = 0
ORDER BY AddedDate DESC;
GO

-- ============================================
-- 10. VIEW SOLD PLATES
-- ============================================
SELECT 
    Id,
    PlateNumber,
    Price,
    Category,
    AddedDate
FROM Plates
WHERE IsSold = 1
ORDER BY AddedDate DESC;
GO

-- ============================================
-- 11. INSERT TEST DATA (Optional)
-- ============================================
-- Uncomment to insert test data
/*
INSERT INTO Plates (PlateNumber, Price, IsSold, Category, AddedDate)
VALUES 
    ('W 1', 350000, 0, 'GOLDEN NUMBER', GETDATE()),
    ('A 88', 280000, 0, '2 DIGIT', GETDATE()),
    ('WWW 1688', 128000, 0, '4 DIGIT', GETDATE());
GO
*/

-- ============================================
-- 12. UPDATE PLATE PRICE
-- ============================================
-- Replace {id} with actual plate ID
/*
UPDATE Plates
SET Price = 400000
WHERE Id = 1;
GO
*/

-- ============================================
-- 13. MARK PLATE AS SOLD
-- ============================================
-- Replace {id} with actual plate ID
/*
UPDATE Plates
SET IsSold = 1
WHERE Id = 1;
GO
*/

-- ============================================
-- 14. DELETE PLATE (Use with caution!)
-- ============================================
-- Replace {id} with actual plate ID
/*
DELETE FROM Plates
WHERE Id = 1;
GO
*/

-- ============================================
-- 15. CHECK DATABASE SIZE AND INFO
-- ============================================
SELECT 
    name AS DatabaseName,
    create_date AS CreatedDate,
    state_desc AS State
FROM sys.databases
WHERE name = 'ebm_plateno';
GO
