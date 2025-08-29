
```sql
CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    GoogleId TEXT NOT NULL,
    Username TEXT NULL DEFAULT NULL,
    AvatarPath TEXT NULL DEFAULT NULL,
    Wins INTEGER NOT NULL DEFAULT 0,
    Losses INTEGER NOT NULL DEFAULT 0,
    SessionId TEXT NULL DEFAULT NULL,
    ExpirationDate TEXT NULL DEFAULT NULL
);

INSERT INTO Users (GoogleId, Username, AvatarPath, Wins, Losses) VALUES
('google-uid-001', 'Alice', 'avatars/alice.png', 5, 2),
('google-uid-002', 'Bob', NULL, 3, 4),
('google-uid-003', 'Charlie', 'avatars/charlie.jpg', 10, 1),
('google-uid-004', 'Diana', NULL, 0, 0),
('google-uid-005', 'Eve', 'avatars/eve.png', 7, 3);

UPDATE Users
SET
    SessionId = null,
    ExpirationDate = null
WHERE Id = 1;
```
