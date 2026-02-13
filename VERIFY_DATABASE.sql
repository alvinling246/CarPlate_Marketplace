-- Quick Verification Script for ebm_plateno Database
-- Run this in SQL Server Management Studio

-- Step 1: Select the database
USE ebm_plateno;
GO

-- Step 2: Check if Plates table exists
PRINT '=== Checking if Plates table exists ===';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Plates')
BEGIN
    PRINT '✓ Plates table EXISTS';
    
    -- Step 3: Show table structure
    PRINT '';
    PRINT '=== Table Structure ===';
    SELECT 
        COLUMN_NAME AS 'Column',
        DATA_TYPE AS 'Type',
        CHARACTER_MAXIMUM_LENGTH AS 'Max Length',
        IS_NULLABLE AS 'Nullable'
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Plates'
    ORDER BY ORDINAL_POSITION;
    
    -- Step 4: Count records
    PRINT '';
    PRINT '=== Record Count ===';
    DECLARE @Total INT, @Available INT, @Sold INT;
    SELECT @Total = COUNT(*) FROM Plates;
    SELECT @Available = COUNT(*) FROM Plates WHERE IsSold = 0;
    SELECT @Sold = COUNT(*) FROM Plates WHERE IsSold = 1;
    
    PRINT 'Total Plates: ' + CAST(@Total AS VARCHAR);
    PRINT 'Available: ' + CAST(@Available AS VARCHAR);
    PRINT 'Sold: ' + CAST(@Sold AS VARCHAR);
    
    -- Step 5: Show sample data (first 10 records)
    PRINT '';
    PRINT '=== Sample Data (First 10 records) ===';
    SELECT TOP 10
        Id,
        PlateNumber,
        Price,
        CASE WHEN IsSold = 1 THEN 'Yes' ELSE 'No' END AS Sold,
        Category,
        AddedDate
    FROM Plates
    ORDER BY AddedDate DESC;
END
ELSE
BEGIN
    PRINT '✗ Plates table does NOT exist';
    PRINT '';
    PRINT 'To create the table, run these commands in your backend folder:';
    PRINT '  cd backend\CarPlateMarketplace.API';
    PRINT '  dotnet ef migrations add InitialCreate';
    PRINT '  dotnet ef database update';
END
GO
