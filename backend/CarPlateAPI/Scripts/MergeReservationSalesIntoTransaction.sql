-- ============================================
-- Merge dbo.Reservation + dbo.Sales into dbo.Transaction
-- Safe to run multiple times (uses NOT EXISTS checks).
-- Assumes:
-- - dbo.Transaction schema: PlateNoId, PurchasedId, DealerOrBuyer, ReservedDate, SoldDate, SoldPrice, Status
-- - Reservation: PlateNoId, BuyerId, ReservedDate, Status
-- - Sales: PlateNoId, BuyerId, SoldDate
-- ============================================
-- USE ebm_plateno;
-- GO

-- 1) Create Transaction if missing
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
    PRINT 'Transaction table created.';
END
GO

-- 2) Bring over Reservation rows (as Reserved / Cancelled / etc.)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reservation')
BEGIN
    INSERT INTO dbo.[Transaction] (PlateNoId, PurchasedId, DealerOrBuyer, ReservedDate, SoldDate, SoldPrice, Status)
    SELECT
        r.PlateNoId,
        r.BuyerId,
        CASE WHEN b.DealerId IS NULL THEN 0 ELSE 1 END AS DealerOrBuyer,
        r.ReservedDate,
        NULL,
        NULL,
        CASE
            WHEN r.Status IS NULL OR LTRIM(RTRIM(r.Status)) = '' THEN 'Reserved'
            WHEN r.Status = 'Active' THEN 'Reserved'
            WHEN r.Status = 'Cancelled' THEN 'Cancelled'
            ELSE r.Status
        END AS Status
    FROM dbo.Reservation r
    INNER JOIN dbo.Buyers b ON b.Id = r.BuyerId
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.[Transaction] t
        WHERE t.PlateNoId = r.PlateNoId
          AND t.PurchasedId = r.BuyerId
          AND ISNULL(t.ReservedDate,'1900-01-01') = ISNULL(r.ReservedDate,'1900-01-01')
          AND t.Status IN ('Reserved','Cancelled','Active','Expired')
    );

    PRINT 'Reservation rows merged into Transaction.';
END
GO

-- 3) Bring over Sales rows (as Sold)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sales')
BEGIN
    INSERT INTO dbo.[Transaction] (PlateNoId, PurchasedId, DealerOrBuyer, ReservedDate, SoldDate, SoldPrice, Status)
    SELECT
        s.PlateNoId,
        s.BuyerId,
        CASE WHEN b.DealerId IS NULL THEN 0 ELSE 1 END AS DealerOrBuyer,
        NULL,
        s.SoldDate,
        CAST(p.Price AS FLOAT),
        'Sold'
    FROM dbo.Sales s
    INNER JOIN dbo.Buyers b ON b.Id = s.BuyerId
    INNER JOIN dbo.Plates p ON p.Id = s.PlateNoId
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.[Transaction] t
        WHERE t.PlateNoId = s.PlateNoId
          AND t.PurchasedId = s.BuyerId
          AND ISNULL(t.SoldDate,'1900-01-01') = ISNULL(s.SoldDate,'1900-01-01')
          AND t.Status = 'Sold'
    );

    PRINT 'Sales rows merged into Transaction.';
END
GO

-- 4) Optional: Drop old tables after verifying data
-- DROP TABLE dbo.Sales;
-- DROP TABLE dbo.Reservation;

PRINT 'Merge into Transaction complete.';

