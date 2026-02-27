-- ============================================
-- Five-table schema: dbo.Dealers, dbo.Plates, dbo.Buyers, dbo.Reservation, dbo.Sales
-- Run against your database (e.g. ebm_plateno). Run MigrateToFiveTables.sql after if you have existing data.
-- ============================================
-- USE ebm_plateno;
-- GO

-- 1. dbo.Dealers (assumed already exists; ensure key columns)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Dealers')
BEGIN
    CREATE TABLE dbo.Dealers (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        PhoneNumber NVARCHAR(20) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        Username NVARCHAR(50) NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        LastLoginDate DATETIME NULL,
        CONSTRAINT UQ_Dealers_Username UNIQUE (Username)
    );
END
GO

-- 2. dbo.Buyers (FullName, PhoneNumber, Email nullable for registered dealer; no Address)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buyers')
BEGIN
    CREATE TABLE dbo.Buyers (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        DealerId INT NULL,
        FullName NVARCHAR(200) NULL,
        PhoneNumber NVARCHAR(50) NULL,
        Email NVARCHAR(100) NULL,
        CONSTRAINT FK_Buyers_Dealers FOREIGN KEY (DealerId) REFERENCES dbo.Dealers(Id) ON DELETE SET NULL
    );
END
GO

-- 3. dbo.Plates (BuyerId FK to Buyers; column order: Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Plates')
BEGIN
    CREATE TABLE dbo.Plates (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PlateNumber NVARCHAR(50) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        BuyerId INT NULL,
        Category NVARCHAR(50) NULL,
        AddedDate DATETIME NOT NULL DEFAULT GETDATE(),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Available',
        CONSTRAINT FK_Plates_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE SET NULL
    );
    PRINT 'Plates table created (BuyerId, Status last).';
END
ELSE IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Plates' AND COLUMN_NAME = 'BuyerId')
BEGIN
    ALTER TABLE dbo.Plates ADD BuyerId INT NULL;
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buyers')
        ALTER TABLE dbo.Plates ADD CONSTRAINT FK_Plates_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE SET NULL;
END
GO

-- 4. dbo.Reservation
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reservation')
BEGIN
    CREATE TABLE dbo.Reservation (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PlateNoId INT NOT NULL,
        BuyerId INT NOT NULL,
        ReservedDate DATETIME NOT NULL,
        ExpiryDate DATETIME NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
        CONSTRAINT FK_Reservation_Plates FOREIGN KEY (PlateNoId) REFERENCES dbo.Plates(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Reservation_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE NO ACTION
    );
END
GO

-- 5. dbo.Sales
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sales')
BEGIN
    CREATE TABLE dbo.Sales (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PlateNoId INT NOT NULL,
        BuyerId INT NOT NULL,
        ReservationId INT NULL,
        SoldDate DATETIME NOT NULL,
        SoldPrice DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_Sales_Plates FOREIGN KEY (PlateNoId) REFERENCES dbo.Plates(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Sales_Buyers FOREIGN KEY (BuyerId) REFERENCES dbo.Buyers(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Sales_Reservation FOREIGN KEY (ReservationId) REFERENCES dbo.Reservation(Id) ON DELETE SET NULL
    );
END
GO

PRINT 'Five-table schema (Dealers, Plates, Buyers, Reservation, Sales) is in place. Run MigrateToFiveTables.sql if you have existing plate data to migrate.';
