-- Run this in SQL Server (e.g. SSMS) against your database (e.g. ebm_plateno)
-- to add Sold/Reserved By, Reserved Date, and Sold Date to the Plates table.
-- Run once; if columns already exist you will get an error (safe to ignore).

USE ebm_plateno;
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'SoldReservedBy')
BEGIN
    ALTER TABLE Plates ADD SoldReservedBy NVARCHAR(200) NULL;
    ALTER TABLE Plates ADD ReservedDate DATE NULL;
    ALTER TABLE Plates ADD SoldDate DATE NULL;
    PRINT 'Added SoldReservedBy, ReservedDate, SoldDate to Plates.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'IsReserved')
BEGIN
    ALTER TABLE Plates ADD IsReserved BIT NOT NULL DEFAULT 0;
    ALTER TABLE Plates ADD ContactNumber NVARCHAR(50) NULL;
    ALTER TABLE Plates ADD Email NVARCHAR(100) NULL;
    PRINT 'Added IsReserved, ContactNumber, Email to Plates.';
END
ELSE
    PRINT 'Columns already exist.';
GO
