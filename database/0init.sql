CREATE DATABASE IF NOT EXISTS ktane;

CREATE TABLE IF NOT EXISTS ktane.module (
   moduleID VARCHAR(255),
   jaName VARCHAR(255),
   recordedAt BIGINT,
   PRIMARY KEY (moduleID, jaName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX module_recordedAt_idx ON ktane.module (recordedAt DESC); 

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
  displayName VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS ktane.exceptionModule (
  moduleID VARCHAR(255) PRIMARY KEY,
  reason VARCHAR(1023)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;