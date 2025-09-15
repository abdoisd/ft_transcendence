
```sql
CREATE TABLE IF NOT EXISTS Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    GoogleId TEXT NOT NULL,
    Username TEXT NULL DEFAULT NULL,
    AvatarPath TEXT NULL DEFAULT NULL,
    Wins INTEGER NOT NULL DEFAULT 0,
    Losses INTEGER NOT NULL DEFAULT 0,
    SessionId TEXT NULL DEFAULT NULL,
    ExpirationDate TEXT NULL DEFAULT NULL,
	LastActivity TEXT NULL DEFAULT NULL,
	TOTPSecretPending TEXT NULL DEFAULT NULL, -- when ever a secret generated, stores it here
	TOTPSecret TEXT NULL DEFAULT NULL -- first (or every) validation, store secret here
);

INSERT INTO Users (GoogleId, Username, AvatarPath, Wins, Losses) VALUES
('google-uid-001', 'Alice', 'avatars/alice.png', 5, 2),
('google-uid-002', 'Bob', NULL, 3, 4),
('google-uid-003', 'Charlie', 'avatars/charlie.jpg', 10, 1),
('google-uid-004', 'Diana', NULL, 0, 0),
('google-uid-005', 'Eve', 'avatars/eve.png', 7, 3);

-- friends, blocks

Relationships
	Id
	User1Id
	User2Id
	Relationship: 1 friends, 0 enemies

CREATE TABLE IF NOT EXISTS Relationships (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    User1Id INTEGER NOT NULL,
    User2Id INTEGER NOT NULL,
    Relationship INTEGER NOT NULL CHECK (Relationship IN (0, 1)), -- sqlite constraint
    FOREIGN KEY (User1Id) REFERENCES Users(Id),
    FOREIGN KEY (User2Id) REFERENCES Users(Id)
);

INSERT INTO Relationships (User1Id, User2Id, Relationship) VALUES
(1, 2, 1),
(1, 3, 0),
(2, 3, 1),
(3, 4, 1);

INSERT INTO Relationships (User1Id, User2Id, Relationship) VALUES
(39, 1, 1),
(39, 2, 1);

-- global
-- list tables
SELECT name FROM sqlite_master WHERE type='table';
-- table info
PRAGMA table_info(Relationships);

-- GAME
CREATE TABLE IF NOT EXISTS Games (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    User1Id INTEGER NOT NULL,
    User2Id INTEGER NULL, -- ai game
    Date TEXT NOT NULL DEFAULT NULL,
	WinnerId INTEGER NOT NULL,
	TournamentId INTEGER NULL, -- game not in tournament

	FOREIGN KEY (User1Id) REFERENCES Users(Id),
    FOREIGN KEY (User2Id) REFERENCES Users(Id)
);

INSERT INTO Games (User1Id, User2Id, Date, WinnerId, TournamentId) VALUES
(1, NULL, '2025-09-15 10:30:00', 1, NULL),
(2, 3, '2025-09-15 11:00:00', 0, NULL),
(4, 5, '2025-09-16 09:15:00', 1, 1),
(6, 7, '2025-09-16 10:45:00', 2, 1),
(8, NULL, '2025-09-17 14:20:00', 1, 2);

CREATE TABLE IF NOT EXISTS Tournaments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
);

```
