-- ============================================
-- dbo.Buyers: make FullName, PhoneNumber, Email nullable (for registered dealer);
-- drop Address column.
-- ============================================
-- USE ebm_plateno;
-- GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Buyers')
BEGIN
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Buyers' AND COLUMN_NAME = 'FullName')
        ALTER TABLE dbo.Buyers ALTER COLUMN FullName NVARCHAR(200) NULL;
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Buyers' AND COLUMN_NAME = 'PhoneNumber')
        ALTER TABLE dbo.Buyers ALTER COLUMN PhoneNumber NVARCHAR(50) NULL;
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Buyers' AND COLUMN_NAME = 'Email')
        ALTER TABLE dbo.Buyers ALTER COLUMN Email NVARCHAR(100) NULL;

    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Buyers' AND COLUMN_NAME = 'Address')
        ALTER TABLE dbo.Buyers DROP COLUMN Address;

    PRINT 'Buyers: FullName, PhoneNumber, Email are nullable; Address dropped.';
END
GO
