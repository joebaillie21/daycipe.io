DROP TABLE IF EXISTS reports;
DROP TYPE IF EXISTS report_type;
DROP TABLE IF EXISTS jokes;
DROP TABLE IF EXISTS recipes;
DROP TYPE IF EXISTS recipe_category;
DROP TABLE IF EXISTS facts;
DROP TYPE IF EXISTS fact_category;

-- Table for facts
CREATE TYPE fact_category AS ENUM ('math', 'physics', 'bio', 'compsci', 'chem');

CREATE TABLE  facts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    content VARCHAR(1000) NOT NULL,
    source VARCHAR(200),
    score INT DEFAULT 0,
    category fact_category NOT NULL,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for recipes
CREATE TYPE recipe_category AS ENUM ('veganism', 'vegetarianism', 'lactose_intolerance', 'gluten_intolerance', 'kosher');

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    content VARCHAR(2000) NOT NULL,
    score INT DEFAULT 0,
    category recipe_category NOT NULL,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for jokes
CREATE TABLE jokes (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    content VARCHAR(500) NOT NULL,
    score INT DEFAULT 0,
    is_shown BOOLEAN DEFAULT TRUE
);

-- Table for reports
CREATE TYPE report_type AS ENUM ('fact', 'recipe', 'joke');

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    type_of_reported_content report_type NOT NULL,
    reported_content_id INT NOT NULL,
    substance_of_report TEXT NOT NULL
);
