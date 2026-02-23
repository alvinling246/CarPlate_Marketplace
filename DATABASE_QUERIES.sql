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
-- 4. CHECK IF Dealers TABLE EXISTS
-- ============================================
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_NAME = 'Dealers')
    PRINT 'Dealers table exists!'
ELSE
    PRINT 'Dealers table does NOT exist. Run migrations first.';
GO

-- ============================================
-- 5. VIEW TABLE STRUCTURE
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

-- View columns and data types of Dealers table
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Dealers'
ORDER BY ORDINAL_POSITION;
GO

-- ============================================
-- 6. VIEW ALL PLATES DATA
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
-- 7. VIEW ALL DEALERS DATA
-- ============================================
SELECT 
    Id,
    FullName,
    PhoneNumber,
    Email,
    Username,
    IsActive,
    CreatedDate,
    LastLoginDate
FROM Dealers
ORDER BY CreatedDate DESC;
GO

-- ============================================
-- 8. COUNT PLATES
-- ============================================
SELECT 
    COUNT(*) AS TotalPlates,
    SUM(CASE WHEN IsSold = 0 THEN 1 ELSE 0 END) AS AvailablePlates,
    SUM(CASE WHEN IsSold = 1 THEN 1 ELSE 0 END) AS SoldPlates
FROM Plates;
GO

-- ============================================
-- 9. COUNT DEALERS
-- ============================================
SELECT 
    COUNT(*) AS TotalDealers,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveDealers,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveDealers
FROM Dealers;
GO

-- ============================================
-- 10. VIEW PLATES BY CATEGORY
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
-- 11. SEARCH PLATES BY NUMBER
-- ============================================
-- Replace '88' with your search term
SELECT * 
FROM Plates
WHERE PlateNumber LIKE '%88%'
ORDER BY Price DESC;
GO

-- ============================================
-- 12. SEARCH DEALERS BY NAME OR USERNAME
-- ============================================
-- Replace 'test' with your search term
SELECT 
    Id,
    FullName,
    PhoneNumber,
    Email,
    Username,
    IsActive,
    CreatedDate
FROM Dealers
WHERE FullName LIKE '%test%' 
   OR Username LIKE '%test%'
ORDER BY CreatedDate DESC;
GO

-- ============================================
-- 13. VIEW AVAILABLE PLATES ONLY
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
-- 14. VIEW ACTIVE DEALERS ONLY
-- ============================================
SELECT 
    Id,
    FullName,
    PhoneNumber,
    Email,
    Username,
    CreatedDate,
    LastLoginDate
FROM Dealers
WHERE IsActive = 1
ORDER BY CreatedDate DESC;
GO

-- ============================================
-- 15. VIEW SOLD PLATES
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
-- 16. VIEW INACTIVE DEALERS
-- ============================================
SELECT 
    Id,
    FullName,
    PhoneNumber,
    Email,
    Username,
    CreatedDate,
    LastLoginDate
FROM Dealers
WHERE IsActive = 0
ORDER BY CreatedDate DESC;
GO

-- ============================================
-- 17. INSERT TEST DATA (Optional)
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

-- Insert test dealer (optional)
/*
INSERT INTO Dealers (FullName, PhoneNumber, Email, Username, Password)
VALUES ('Test Dealer', '012-3456789', 'dealer@example.com', 'testdealer', 'hashed_password_here');
GO
*/

-- ============================================
-- 18. UPDATE PLATE PRICE
-- ============================================
-- Replace {id} with actual plate ID
/*
UPDATE Plates
SET Price = 400000
WHERE Id = 1;
GO
*/

-- ============================================
-- 19. MARK PLATE AS SOLD
-- ============================================
-- Replace {id} with actual plate ID
/*
UPDATE Plates
SET IsSold = 1
WHERE Id = 1;
GO
*/

-- ============================================
-- 20. UPDATE DEALER STATUS
-- ============================================
-- Replace {id} with actual dealer ID
/*
UPDATE Dealers
SET IsActive = 0
WHERE Id = 1;
GO
*/

-- ============================================
-- 21. UPDATE DEALER LAST LOGIN
-- ============================================
-- Replace {username} with actual username
/*
UPDATE Dealers
SET LastLoginDate = GETDATE()
WHERE Username = 'testdealer';
GO
*/

-- ============================================
-- 22. DELETE PLATE (Use with caution!)
-- ============================================
-- Replace {id} with actual plate ID
/*
DELETE FROM Plates
WHERE Id = 1;
GO
*/

-- ============================================
-- 23. DELETE DEALER (Use with caution!)
-- ============================================
-- Replace {id} with actual dealer ID
/*
DELETE FROM Dealers
WHERE Id = 1;
GO
*/

-- ============================================
-- 24. CHECK DATABASE SIZE AND INFO
-- ============================================
SELECT 
    name AS DatabaseName,
    create_date AS CreatedDate,
    state_desc AS State
FROM sys.databases
WHERE name = 'ebm_plateno';
GO
