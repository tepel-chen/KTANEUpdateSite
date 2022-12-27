CREATE DATABASE IF NOT EXISTS ktane;

CREATE TABLE IF NOT EXISTS ktane.module (
   moduleID VARCHAR(256),
   jaName VARCHAR(512),
   recordedAt BIGINT,
   PRIMARY KEY (moduleID, jaName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX module_recordedAt_idx ON ktane.module (recordedAt DESC); 

CREATE TABLE IF NOT EXISTS ktane.moduleUpdate (
  moduleID VARCHAR(256),
  prevJaName VARCHAR(512),
  newJaName VARCHAR(512),
  recordedAt BIGINT,
  PRIMARY KEY (recordedAt DESC, moduleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;