-- ============================================
-- Six-table schema: dbo.Users, dbo.Dealers, dbo.Plates, dbo.Buyers, dbo.Transaction
-- Run against your database (e.g. ebm_plateno). Run MigrateToFiveTables.sql after if you have existing data.
-- ============================================
-- USE ebm_plateno;
-- GO

-- 1. dbo.Users (login accounts; used by Dealers and potentially other roles)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        Password NVARCHAR(255) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Dealer',
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        LastLoginDate DATETIME NULL,
        CONSTRAINT UQ_Users_Username UNIQUE (Username)
    );
END
GO

-- 2. dbo.Dealers (profile only; login fields live in dbo.Users)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Dealers')
BEGIN
    CREATE TABLE dbo.Dealers (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        PhoneNumber NVARCHAR(20) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        UserId INT NOT NULL,
        CONSTRAINT UQ_Dealers_UserId UNIQUE (UserId),
        CONSTRAINT FK_Dealers_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE NO ACTION
    );
END
GO

-- 3. dbo.Buyers (FullName, PhoneNumber, Email nullable for registered dealer; no Address)
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

-- 4. dbo.Plates (no direct BuyerId; buyer info via Transaction)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Plates')
BEGIN
    CREATE TABLE dbo.Plates (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PlateNumber NVARCHAR(50) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        Category NVARCHAR(50) NULL,
        AddedDate DATETIME NOT NULL DEFAULT GETDATE(),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Available'
    );
    PRINT 'Plates table created (no BuyerId; Status last).';
END
GO

-- 5. dbo.Transaction (unified reservation + sales)
IF OBJECT_ID(N'dbo.[Transaction]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[Transaction] (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PlateNoId INT NOT NULL,
        PurchasedId INT NOT NULL,
        DealerOrBuyer INT NOT NULL,
        ReservedDate DATETIME NULL,
        SoldDate DATETIME NULL,
        SoldPrice FLOAT NULL,
        Status VARCHAR(50) NOT NULL,
        CONSTRAINT FK_Transaction_Plates FOREIGN KEY (PlateNoId) REFERENCES dbo.Plates(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Transaction_Buyers FOREIGN KEY (PurchasedId) REFERENCES dbo.Buyers(Id) ON DELETE NO ACTION
    );
END
GO

PRINT 'Schema (Users, Dealers, Plates, Buyers, Transaction) is in place. Run MigrateToFiveTables.sql if you have existing plate data to migrate.';
