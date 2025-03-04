-- db creation file, example statement below

CREATE TABLE IF NOT EXISTS facts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fact VARCHAR(500) NOT NULL,
);