# Daycipe.io
Daycipe.io is a combination of user interaction and AI generated content as follows:
- Facts: Category-specific facts related to the day in which a user logs on
- Recipes: Recipes prompted to be specific to the date of the user log in, with variation for dietary restrictions
- Jokes: Three (3) generated jokes that will be voted on by users, with the jokes shown on a rotation carousel

# Pre-requisites
1. Node.js - verify Node with ```node -v```. If Node is not installed, you can download it [here](https://nodejs.org/en/download)
2. PostgreSQL - you can install it [here](https://www.postgresql.org/download/)

# Utilization
1. In the server directory run ```npm install``` to download the required packages
2. Run ```node index.js``` to run the server. 
    - Correct functioning of this should result in the output *Server listening on port 3001* 
    - The server can be killed with Ctrl+C or killing the terminal
3. To run the tests ```npm test``` 


[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SWEN-732-Group-2_daycipe&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SWEN-732-Group-2_daycipe)