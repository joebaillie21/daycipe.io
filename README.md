# Daycipe.io
Daycipe.io is a combination of user interaction and AI generated content as follows:
- Facts: Category-specific facts related to the day in which a user logs on
- Recipes: Recipes prompted to be specific to the date of the user log in, with variation for dietary restrictions
- Jokes: Three (3) generated jokes that will be voted on by users, with the jokes shown on a rotation carousel

# Pre-requisites
1. Node.js - verify Node with ```node -v```. If Node is not installed, you can download it [here](https://nodejs.org/en/download)
2. PostgreSQL - you can install it [here](https://www.postgresql.org/download/)

# Dev Utilization
## Server(Backend) Setup:
0. `cd server`
1. Run ```npm install``` to download the required packages
2. Run ```node index.js``` to run the server. The `.env` file automatically specifies developer mode, and expects a Postgres database on the provided URL.
    - Correct functioning of this should result in the output `Server listening on port 3001` 
    - The server can be killed with Ctrl+C or killing the terminal
3. To run the tests ```npm test``` or `npx jest` to produce a coverage report.  

## Populating the Database:
0. `cd server/db`
1. To generate and post to the local database, run `python generate_and_post.py --d {number of days}`.
2. If you already have the generated outputs in `daily_outputs` and simply want to post to the database, run `python json_to_server_poster.py --d {number of days}`  

After this, the backend and the database should be functioning. You can verify this by running `http://localhost:3001/api/jokes/` which should show all the generated jokes in simple text format.  

## Client(Frontend) Setup
0. `cd client`
1. Run ```npm install``` to download the required packages
2. Run `npm run start` to create the development version of the frontend, which should open automatically. If not, the terminal output should contain the link: `http://localhost:3000`

# Deployment

A GitHub Actions workflow is setup that automatically deploys all the changes pushed to the Deployment branch to 3 services hosted on [Render](https://dashboard.render.com/project/prj-d03af69r0fns73fuu06g). However, the database is not populated. It is required that a human verifies the AI generated text and completes the post function. Since it is expected that you complete a local build before pushing to production, it is assumed that you already have data in `server/db/daily_outputs` and curated it. After everything is verified to be in order, post to the deployed database by running `python json_to_server_poster.py --d {number of days} --production`


[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SWEN-732-Group-2_daycipe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SWEN-732-Group-2_daycipe)