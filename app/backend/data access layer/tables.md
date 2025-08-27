
```sql
CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    GoogleOpenID TEXT NOT NULL,
    Username TEXT NOT NULL,
    AvatarPath TEXT NULL,
    Wins INTEGER NOT NULL DEFAULT 0,
    Losses INTEGER NOT NULL DEFAULT 0
);

INSERT INTO Users (GoogleOpenID, Username, AvatarPath, Wins, Losses) VALUES
('google-uid-001', 'Alice', 'avatars/alice.png', 5, 2),
('google-uid-002', 'Bob', NULL, 3, 4),
('google-uid-003', 'Charlie', 'avatars/charlie.jpg', 10, 1),
('google-uid-004', 'Diana', NULL, 0, 0),
('google-uid-005', 'Eve', 'avatars/eve.png', 7, 3);
```
