CREATE DATABASE IF NOT EXISTS ktane;

CREATE TABLE IF NOT EXISTS ktane.module (
  moduleID VARCHAR(255),
  jaName VARCHAR(255),
  recordedAt BIGINT,
  PRIMARY KEY (moduleID, jaName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/* ALTER TABLE ktane.module ADD INDEX module_recordedAt_idx (recordedAt DESC); */

CREATE TABLE IF NOT EXISTS ktane.moduleUpdate (
  moduleID VARCHAR(255),
  prevJaName VARCHAR(255),
  newJaName VARCHAR(255),
  recordedAt BIGINT,
  PRIMARY KEY (recordedAt DESC, moduleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS ktane.moduleName (
  moduleID VARCHAR(255) PRIMARY KEY,
  moduleName VARCHAR(255),
  displayName VARCHAR(255),
  jaName VARCHAR(255),
  manualUrl VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS ktane.exceptionModule (
  moduleID VARCHAR(255) PRIMARY KEY,
  reason VARCHAR(1023)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS ktane.toBeTranslated (
  moduleID VARCHAR(255) PRIMARY KEY REFERENCES ktane.moduleName(moduleID),
  userID VARCHAR(255),
  jaName VARCHAR(255),
  translationStatus ENUM("Unassigned", "Assigned", "Translated", "Submitted"),
  remarks VARCHAR(1023)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE DATABASE IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  emailVerified TIMESTAMP,
  image VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS auth.account (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(255),
  type VARCHAR(255),
  provider VARCHAR(255),
  providerAccountId VARCHAR(255),
  refresh_token VARCHAR(255),
  access_token VARCHAR(255),
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token VARCHAR(255),
  session_date VARCHAR(255),
  oauth_token_secret VARCHAR(255),
  oauth_token VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS auth.session (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  expires TIMESTAMP,
  sessionToken VARCHAR(255),
  userId VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS auth.verificationToken (
  identifier VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255),
  expires TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


