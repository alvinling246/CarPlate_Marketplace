-- Migrate Plates from IsSold/IsReserved to Status column.
-- Run in SQL Server (e.g. SSMS) against your database (e.g. ebm_plateno).
-- Status values: Available, Reserved, Sold

USE ebm_plateno;
GO

-- 1. Add Status column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'Status')
BEGIN
    ALTER TABLE Plates ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Available';
    PRINT 'Added Status column.';
END
GO

-- 2. Migrate data: set Status from IsSold and IsReserved (if old columns exist)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'IsSold')
BEGIN
    UPDATE Plates
    SET Status = CASE
        WHEN IsSold = 1 THEN 'Sold'
        WHEN IsReserved = 1 THEN 'Reserved'
        ELSE 'Available'
    END;
    PRINT 'Migrated Status from IsSold/IsReserved.';
END
GO

-- 3. Drop default constraint on IsSold, then drop IsSold column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'IsSold')
BEGIN
    DECLARE @IsSoldConstraint SYSNAME;
    SELECT @IsSoldConstraint = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('Plates') AND c.name = 'IsSold';
    IF @IsSoldConstraint IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE Plates DROP CONSTRAINT ' + QUOTENAME(@IsSoldConstraint));
        PRINT 'Dropped default constraint on IsSold.';
    END
    ALTER TABLE Plates DROP COLUMN IsSold;
    PRINT 'Dropped IsSold column.';
END
GO

-- 4. Drop default constraint on IsReserved, then drop IsReserved column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'IsReserved')
BEGIN
    DECLARE @IsReservConstraint SYSNAME;
    SELECT @IsReservConstraint = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('Plates') AND c.name = 'IsReserved';
    IF @IsReservConstraint IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE Plates DROP CONSTRAINT ' + QUOTENAME(@IsReservConstraint));
        PRINT 'Dropped default constraint on IsReserved.';
    END
    ALTER TABLE Plates DROP COLUMN IsReserved;
    PRINT 'Dropped IsReserved column.';
END
GO

PRINT 'Migration to Status column complete.';
GO
