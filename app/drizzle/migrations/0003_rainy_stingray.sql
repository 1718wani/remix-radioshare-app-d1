-- 外部キー制約を無効化
PRAGMA foreign_keys = OFF;
-- データの削除
DELETE FROM userHighlights;
DELETE FROM highlights;
DELETE FROM radioshows;
DELETE FROM users;

-- テーブルの削除
DROP TABLE IF EXISTS userHighlights;
DROP TABLE IF EXISTS highlights;
DROP TABLE IF EXISTS radioshows;
DROP TABLE IF EXISTS users;
-- 外部キー制約を再度有効化
PRAGMA foreign_keys = ON;