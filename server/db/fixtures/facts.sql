-- test facts data for integration tests

INSERT INTO facts(date, content, source, score, category) VALUES 
(
    CURRENT_DATE,
    'Interesting fact!',
    'google.com',
    100,
    'math'
),
(
    '2025-03-05',
    'Fact from the past',
    'theonion.net',
    16,
    'chem'
),
(
    '2027-08-09',
    'Fact from the future',
    'wikipedia.com',
    422,
    'physics'
)