-- Throwaway test database. Do not load this into a real one.
CREATE TABLE Users (
  ID        INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(50) NOT NULL DEFAULT '',
  lastName  VARCHAR(50) NOT NULL DEFAULT '',
  Login     VARCHAR(50) NOT NULL DEFAULT '',
  Password  VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
);

CREATE TABLE Colors (
  ID     INT NOT NULL AUTO_INCREMENT,
  Name   VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
);

INSERT INTO Users (firstName, lastName, Login, Password) VALUES
  ('Test', 'User', 'tester', 'secret'),
  ('Other', 'User', 'other', 'secret');

INSERT INTO Colors (Name, UserID) VALUES
  ('Blue', 1),
  ('Black', 1),
  ('Red', 1),
  ('Crimson', 2);
