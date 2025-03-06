-- Table for facts
CREATE TYPE IF NOT EXISTS fact_category AS ENUM ('math', 'physics', 'bio', 'compsci', 'chem');

CREATE TABLE IF NOT EXISTS facts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    score INT DEFAULT 0,
    category fact_category NOT NULL,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for recipes
CREATE TYPE IF NOT EXISTS recipe_category AS ENUM ('veganism', 'vegetarianism', 'lactose_intolerance', 'gluten_intolerance', 'kosher');

CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    score INT DEFAULT 0,
    category recipe_category NOT NULL,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for jokes
CREATE TABLE IF NOT EXISTS jokes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    score INT DEFAULT 0,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for reports
CREATE TYPE IF NOT EXISTS report_type AS ENUM ('fact', 'recipe', 'joke');

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_of_reported_content report_type NOT NULL,
    reported_content_id INT NOT NULL,
    substance_of_report TEXT NOT NULL,
    CONSTRAINT fk_reported_fact FOREIGN KEY (reported_content_id) 
        REFERENCES facts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reported_recipe FOREIGN KEY (reported_content_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reported_joke FOREIGN KEY (reported_content_id)
        REFERENCES jokes(id) ON DELETE CASCADE ON UPDATE CASCADE
);
