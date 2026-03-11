-- ============================================
-- Add dbo.Users and migrate dealer login fields
-- Moves Dealers.Username/Password/IsActive/CreatedDate/LastLoginDate -> Users
-- and links Dealers.UserId -> Users.Id (1:1)
-- ============================================
-- USE ebm_plateno;
-- GO

-- 1) Create dbo.Users if missing
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
    PRINT 'Users table created.';
END
GO

-- 2) Ensure Dealers has UserId column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'UserId')
BEGIN
    ALTER TABLE dbo.Dealers ADD UserId INT NULL;
    PRINT 'Dealers.UserId column added (NULL for now).';
END
GO

-- 3) If legacy login columns exist in Dealers, migrate them into Users and set UserId
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'Username')
BEGIN
    -- Insert users (skip usernames already present)
    INSERT INTO dbo.Users (Username, Password, Role, IsActive, CreatedDate, LastLoginDate)
    SELECT
        LTRIM(RTRIM(d.Username)) AS Username,
        ISNULL(d.Password, '') AS Password,
        'Dealer' AS Role,
        ISNULL(d.IsActive, 1) AS IsActive,
        ISNULL(d.CreatedDate, GETDATE()) AS CreatedDate,
        d.LastLoginDate
    FROM dbo.Dealers d
    WHERE d.Username IS NOT NULL
      AND LTRIM(RTRIM(d.Username)) <> ''
      AND NOT EXISTS (SELECT 1 FROM dbo.Users u WHERE u.Username = LTRIM(RTRIM(d.Username)));

    -- Link dealers to users by Username
    UPDATE d
    SET d.UserId = u.Id
    FROM dbo.Dealers d
    INNER JOIN dbo.Users u
        ON u.Username = LTRIM(RTRIM(d.Username))
    WHERE d.UserId IS NULL;

    PRINT 'Migrated dealer login fields into Users and linked Dealers.UserId.';
END
GO

-- 4) Make Dealers.UserId NOT NULL if possible
IF EXISTS (SELECT 1 FROM dbo.Dealers WHERE UserId IS NULL)
BEGIN
    PRINT 'WARNING: Some Dealers rows still have NULL UserId. Fix those rows before enforcing NOT NULL / constraints.';
END
ELSE
BEGIN
    ALTER TABLE dbo.Dealers ALTER COLUMN UserId INT NOT NULL;

    -- Add unique + FK constraints if missing
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE [type] = 'UQ' AND [name] = 'UQ_Dealers_UserId')
        ALTER TABLE dbo.Dealers ADD CONSTRAINT UQ_Dealers_UserId UNIQUE (UserId);
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = 'FK_Dealers_Users')
        ALTER TABLE dbo.Dealers ADD CONSTRAINT FK_Dealers_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE NO ACTION;

    PRINT 'Dealers.UserId enforced and constrained.';
END
GO

-- 5) Drop legacy columns from Dealers (optional but recommended)
-- Drop constraints/indexes that depend on legacy columns first (SQL Server blocks DROP COLUMN otherwise)
DECLARE @sqlDrop NVARCHAR(MAX) = N'';

-- 5a) Drop constraints (PK/UQ/FK/DEFAULT/CHECK) that reference legacy columns
;WITH deps AS (
    SELECT
        dc.name AS constraint_name,
        dc.type_desc AS constraint_type,
        OBJECT_SCHEMA_NAME(dc.parent_object_id) AS schema_name,
        OBJECT_NAME(dc.parent_object_id) AS table_name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c
        ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID('dbo.Dealers')
      AND c.name IN ('Username', 'Password', 'IsActive', 'CreatedDate', 'LastLoginDate')
    UNION ALL
    SELECT
        kc.name,
        kc.type_desc,
        OBJECT_SCHEMA_NAME(kc.parent_object_id),
        OBJECT_NAME(kc.parent_object_id)
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic
        ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
    INNER JOIN sys.columns c
        ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE kc.parent_object_id = OBJECT_ID('dbo.Dealers')
      AND c.name IN ('Username', 'Password', 'IsActive', 'CreatedDate', 'LastLoginDate')
    UNION ALL
    SELECT
        cc.name,
        cc.type_desc,
        OBJECT_SCHEMA_NAME(cc.parent_object_id),
        OBJECT_NAME(cc.parent_object_id)
    FROM sys.check_constraints cc
    WHERE cc.parent_object_id = OBJECT_ID('dbo.Dealers')
      AND (
        cc.definition LIKE '%[Username]%' OR cc.definition LIKE '%Username%'
        OR cc.definition LIKE '%[Password]%' OR cc.definition LIKE '%Password%'
        OR cc.definition LIKE '%[IsActive]%' OR cc.definition LIKE '%IsActive%'
        OR cc.definition LIKE '%[CreatedDate]%' OR cc.definition LIKE '%CreatedDate%'
        OR cc.definition LIKE '%[LastLoginDate]%' OR cc.definition LIKE '%LastLoginDate%'
      )
    UNION ALL
    SELECT
        fk.name,
        fk.type_desc,
        OBJECT_SCHEMA_NAME(fk.parent_object_id),
        OBJECT_NAME(fk.parent_object_id)
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc
        ON fkc.constraint_object_id = fk.object_id
    INNER JOIN sys.columns c
        ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
    WHERE fk.parent_object_id = OBJECT_ID('dbo.Dealers')
      AND c.name IN ('Username', 'Password', 'IsActive', 'CreatedDate', 'LastLoginDate')
)
SELECT @sqlDrop = @sqlDrop +
    N'IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N''' + QUOTENAME(schema_name) + N'.' + QUOTENAME(constraint_name) + N''')) ' +
    N'ALTER TABLE dbo.Dealers DROP CONSTRAINT ' + QUOTENAME(constraint_name) + N';' + CHAR(13) + CHAR(10)
FROM (SELECT DISTINCT constraint_name, schema_name FROM deps) d;

-- 5b) Drop indexes that include legacy columns
;WITH idx AS (
    SELECT DISTINCT i.name AS index_name
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic
        ON ic.object_id = i.object_id AND ic.index_id = i.index_id
    INNER JOIN sys.columns c
        ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE i.object_id = OBJECT_ID('dbo.Dealers')
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0
      AND c.name IN ('Username', 'Password', 'IsActive', 'CreatedDate', 'LastLoginDate')
)
SELECT @sqlDrop = @sqlDrop +
    N'IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N''dbo.Dealers'') AND name = N''' + REPLACE(index_name,'''','''''') + N''') ' +
    N'DROP INDEX ' + QUOTENAME(index_name) + N' ON dbo.Dealers;' + CHAR(13) + CHAR(10)
FROM idx;

IF (LEN(@sqlDrop) > 0)
BEGIN
    EXEC sp_executesql @sqlDrop;
    PRINT 'Dropped legacy constraints/indexes on Dealers.';
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'Username')
    ALTER TABLE dbo.Dealers DROP COLUMN Username;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'Password')
    ALTER TABLE dbo.Dealers DROP COLUMN Password;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'IsActive')
    ALTER TABLE dbo.Dealers DROP COLUMN IsActive;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'CreatedDate')
    ALTER TABLE dbo.Dealers DROP COLUMN CreatedDate;
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Dealers' AND COLUMN_NAME = 'LastLoginDate')
    ALTER TABLE dbo.Dealers DROP COLUMN LastLoginDate;
GO

PRINT 'Dealer -> Users migration complete.';

