-- ============================================
-- Migrate existing Plates data into Buyers, Reservation, Sales
-- Run CreateFiveTableSchema.sql first. Run this only if Plates still have SoldReservedBy/ReservedDate/SoldDate etc.
-- ============================================
-- USE ebm_plateno;
-- GO

-- Ensure new tables exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buyers')
    RAISERROR('Run CreateFiveTableSchema.sql first.', 16, 1);
GO

-- Migrate Reserved plates: create Buyer + Reservation
DECLARE @PlateId INT, @SoldReservedBy NVARCHAR(200), @ReservedDate DATE, @ContactNumber NVARCHAR(50), @Email NVARCHAR(100);
DECLARE @BuyerId INT;

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'SoldReservedBy')
BEGIN
    DECLARE rc CURSOR LOCAL FAST_FORWARD FOR
        SELECT Id, ISNULL(SoldReservedBy,''), ReservedDate, ContactNumber, Email
        FROM dbo.Plates
        WHERE Status = 'Reserved' AND (ReservedDate IS NOT NULL OR SoldReservedBy IS NOT NULL OR ContactNumber IS NOT NULL);

    OPEN rc;
    FETCH NEXT FROM rc INTO @PlateId, @SoldReservedBy, @ReservedDate, @ContactNumber, @Email;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@SoldReservedBy,''))) = '' SET @SoldReservedBy = 'Unknown';
        INSERT INTO dbo.Buyers (DealerId, FullName, PhoneNumber, Email)
        VALUES (NULL, @SoldReservedBy, ISNULL(@ContactNumber,''), @Email);
        SET @BuyerId = SCOPE_IDENTITY();
        INSERT INTO dbo.Reservation (PlateNoId, BuyerId, ReservedDate, ExpiryDate, Status)
        VALUES (@PlateId, @BuyerId, ISNULL(CAST(@ReservedDate AS DATETIME), GETDATE()), NULL, 'Active');
        FETCH NEXT FROM rc INTO @PlateId, @SoldReservedBy, @ReservedDate, @ContactNumber, @Email;
    END
    CLOSE rc;
    DEALLOCATE rc;
    PRINT 'Migrated Reserved plates to Buyers + Reservation.';
END
GO

-- Migrate Sold plates: create Buyer + Sale (reuse Buyer by name+phone if possible to avoid duplicates)
DECLARE @PlateId INT, @SoldReservedBy NVARCHAR(200), @SoldDate DATE, @Price DECIMAL(18,2), @ContactNumber NVARCHAR(50), @Email NVARCHAR(100);
DECLARE @BuyerId INT;

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'SoldDate')
BEGIN
    DECLARE sc CURSOR LOCAL FAST_FORWARD FOR
        SELECT p.Id, ISNULL(p.SoldReservedBy,''), p.SoldDate, p.Price, p.ContactNumber, p.Email
        FROM dbo.Plates p
        WHERE p.Status = 'Sold';

    OPEN sc;
    FETCH NEXT FROM sc INTO @PlateId, @SoldReservedBy, @SoldDate, @Price, @ContactNumber, @Email;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF LTRIM(RTRIM(ISNULL(@SoldReservedBy,''))) = '' SET @SoldReservedBy = 'Unknown';
        INSERT INTO dbo.Buyers (DealerId, FullName, PhoneNumber, Email)
        VALUES (NULL, @SoldReservedBy, ISNULL(@ContactNumber,''), @Email);
        SET @BuyerId = SCOPE_IDENTITY();
        INSERT INTO dbo.Sales (PlateNoId, BuyerId, ReservationId, SoldDate, SoldPrice)
        VALUES (@PlateId, @BuyerId, NULL, ISNULL(CAST(@SoldDate AS DATETIME), GETDATE()), ISNULL(@Price, 0));
        FETCH NEXT FROM sc INTO @PlateId, @SoldReservedBy, @SoldDate, @Price, @ContactNumber, @Email;
    END
    CLOSE sc;
    DEALLOCATE sc;
    PRINT 'Migrated Sold plates to Buyers + Sales.';
END
GO

-- Drop old columns from Plates (optional; uncomment when ready)
/*
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
PRINT 'Dropped legacy columns from Plates.';
*/
GO
