DROP TABLE IF EXISTS users, favoriteLists;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    username VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS favoriteLists(
    id SERIAL PRIMARY KEY,
    download_url VARCHAR(255),
    page_url VARCHAR(255),
    user_id INTEGER REFERENCES users (id),
    data_type VARCHAR(255),
    note VARCHAR(255) DEFAULT 'No Notes are added'
);