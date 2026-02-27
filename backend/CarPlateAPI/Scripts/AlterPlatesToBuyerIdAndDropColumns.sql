-- ============================================
-- dbo.Plates: remove SoldReservedBy, ReservedDate, SoldDate, ContactNumber, Email;
-- change DealerId to BuyerId (FK to Buyers); make Status the last column.
-- Run after CreateFiveTableSchema (Buyers table must exist).
-- ============================================
-- USE ebm_plateno;
-- GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Plates')
    RETURN;
GO

-- 1. Drop legacy columns if they exist
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'SoldReservedBy')
    ALTER TABLE dbo.Plates DROP COLUMN SoldReservedBy;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'ReservedDate')
    ALTER TABLE dbo.Plates DROP COLUMN ReservedDate;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'SoldDate')
    ALTER TABLE dbo.Plates DROP COLUMN SoldDate;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'ContactNumber')
    ALTER TABLE dbo.Plates DROP COLUMN ContactNumber;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'Email')
    ALTER TABLE dbo.Plates DROP COLUMN Email;
GO

-- 2. DealerId -> BuyerId: drop DealerId (and its FK), add BuyerId FK to Buyers
--    (We add new BuyerId column and drop DealerId because Dealer IDs are not valid Buyer IDs.)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'DealerId')
BEGIN
    DECLARE @fk NVARCHAR(200);
    DECLARE @sql NVARCHAR(500);
    SELECT @fk = name FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Plates') AND referenced_object_id = OBJECT_ID('dbo.Dealers');
    IF @fk IS NOT NULL
    BEGIN
        SET @sql = N'ALTER TABLE dbo.Plates DROP CONSTRAINT ' + QUOTENAME(@fk);
        EXEC sp_executesql @sql;
    END
    ALTER TABLE dbo.Plates DROP COLUMN DealerId;
    PRINT 'Plates: DealerId dropped.';
END
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'BuyerId')
BEGIN
    ALTER TABLE dbo.Plates ADD BuyerId INT NULL;
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buyers')
        ALTER TABLE dbo.Plates ADD CONSTRAINT FK_Plates_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE SET NULL;
    PRINT 'Plates: BuyerId added, FK to Buyers.';
END
GO

-- 3. Move Status to last column (recreate table: Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status)
-- Run only when Status is not already the last column
IF EXISTS (SELECT 1 FROM (SELECT TOP 1 COLUMN_NAME AS lastCol FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' ORDER BY ORDINAL_POSITION DESC) t WHERE t.lastCol <> 'Status')
BEGIN
    DECLARE @fkRes NVARCHAR(200), @fkSales NVARCHAR(200), @sql2 NVARCHAR(500), @maxId INT;

    -- Drop FKs that reference Plates (Reservation.PlateNoId, Sales.PlateNoId)
    SELECT @fkRes = name FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Reservation') AND referenced_object_id = OBJECT_ID('dbo.Plates');
    IF @fkRes IS NOT NULL BEGIN SET @sql2 = N'ALTER TABLE dbo.Reservation DROP CONSTRAINT ' + QUOTENAME(@fkRes); EXEC sp_executesql @sql2; END
    SELECT @fkSales = name FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Sales') AND referenced_object_id = OBJECT_ID('dbo.Plates');
    IF @fkSales IS NOT NULL BEGIN SET @sql2 = N'ALTER TABLE dbo.Sales DROP CONSTRAINT ' + QUOTENAME(@fkSales); EXEC sp_executesql @sql2; END

    -- Drop FK from Plates to Buyers (so we can drop Plates)
    SELECT @fkRes = name FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Plates') AND referenced_object_id = OBJECT_ID('dbo.Buyers');
    IF @fkRes IS NOT NULL BEGIN SET @sql2 = N'ALTER TABLE dbo.Plates DROP CONSTRAINT ' + QUOTENAME(@fkRes); EXEC sp_executesql @sql2; END

    -- Create new table with column order: Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status
    CREATE TABLE dbo.Plates_new (
        Id INT IDENTITY(1,1) NOT NULL,
        PlateNumber NVARCHAR(50) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        BuyerId INT NULL,
        Category NVARCHAR(50) NULL,
        AddedDate DATETIME NOT NULL DEFAULT GETDATE(),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Available',
        CONSTRAINT PK_Plates_new PRIMARY KEY (Id)
    );
    ALTER TABLE dbo.Plates_new ADD CONSTRAINT FK_Plates_new_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE SET NULL;

    SET IDENTITY_INSERT dbo.Plates_new ON;
    INSERT INTO dbo.Plates_new (Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status)
    SELECT Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status FROM dbo.Plates;
    SET IDENTITY_INSERT dbo.Plates_new OFF;

    DROP TABLE dbo.Plates;
    EXEC sp_rename 'dbo.Plates_new', 'Plates';
    EXEC sp_rename 'PK_Plates_new', 'PK_Plates';
    EXEC sp_rename 'FK_Plates_new_Buyers', 'FK_Plates_Buyers';

    SELECT @maxId = ISNULL(MAX(Id), 0) FROM dbo.Plates;
    DBCC CHECKIDENT('dbo.Plates', RESEED, @maxId);

    -- Re-add FKs from Reservation and Sales to Plates
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reservation')
        ALTER TABLE dbo.Reservation ADD CONSTRAINT FK_Reservation_Plates FOREIGN KEY (PlateNoId) REFERENCES dbo.Plates(Id) ON DELETE NO ACTION;
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sales')
        ALTER TABLE dbo.Sales ADD CONSTRAINT FK_Sales_Plates FOREIGN KEY (PlateNoId) REFERENCES dbo.Plates(Id) ON DELETE NO ACTION;

    PRINT 'Plates recreated with Status as last column.';
END
GO

PRINT 'Plates: legacy columns dropped, DealerId replaced by BuyerId.';
