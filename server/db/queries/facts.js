const conn = require("../conn");

// Get all facts (example)
const getFacts = async () => {
    const result = await conn.query("SELECT * FROM facts");
    return result.rows;
};

module.exports = { getFacts };