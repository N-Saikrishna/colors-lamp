# Colors LAMP

A small web app for COP 4331. It's built on the LAMP stack. Users log in, add colors to their own list, and search the colors they've saved. Each user only sees their own colors.

## Tech stack

- **Linux:** an Ubuntu droplet on DigitalOcean
- **Apache:** serves the frontend and the PHP API
- **MySQL:** stores users and colors
- **PHP:** the JSON API endpoints in `api/`
- **HTML/CSS/JavaScript:** the frontend in `public/`
- **md5.js:** a client-side MD5 library for hashing passwords. The page loads it, but the hashing call in `public/js/code.js` is commented out right now, so passwords are sent as plain text. See [Limitations](#limitations).

## Project layout

```
api/
  Login.php            POST {login, password}  -> {id, firstName, lastName, error}
  AddColor.php         POST {color, userId}    -> {error}
  SearchColors.php     POST {search, userId}   -> {results, error}
  config.example.php   template for database credentials
public/
  index.html           login page
  color.html           add/search colors page
  js/code.js           frontend logic and API calls
  js/md5.js            MD5 library
  css/, images/
```

## Setup

### 1. Create the droplet

Create an Ubuntu droplet on DigitalOcean, SSH in, and install the LAMP packages:

```bash
sudo apt update
sudo apt install apache2 mysql-server php libapache2-mod-php php-mysql
```

### 2. Create the database, tables, and user

Run `sudo mysql` and then:

```sql
CREATE DATABASE COP4331;
USE COP4331;

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

CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_db_password';
GRANT ALL PRIVILEGES ON COP4331.* TO 'your_db_user'@'localhost';
FLUSH PRIVILEGES;
```

Add at least one row to `Users` so you have an account to log in with.

### 3. Configure the API

```bash
cp api/config.example.php api/config.php
```

Edit `api/config.php` and set `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` to match the database above. `config.php` is listed in `.gitignore`, so it should never be committed.

### 4. Upload the files

- Upload `api/` to `/var/www/html/LAMPAPI`, including your `config.php`.
- Upload the contents of `public/` to `/var/www/html`.

If you deploy to a different address, update `urlBase` at the top of `public/js/code.js`.

## Access

http://157.245.140.238

## Limitations

- **MD5 isn't secure password hashing.** It's fast and unsalted, so it's easy to brute-force. Client-side hashing is also disabled right now, so passwords are sent and stored as plain text. A real app would hash on the server with `password_hash()`.
- **There's no HTTPS.** All traffic, including login credentials, is sent unencrypted.
- **It's reachable only by IP address.** The app lives at a bare IP until a domain is set up.
