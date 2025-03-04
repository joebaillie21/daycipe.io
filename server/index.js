const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const factsRoutes = require("./routes/factsRoutes");
const jokesRoutes = require("./routes/jokesRoutes");
const recipiesRoutes = require("./routes/recipiesRoutes");
const reportsRoutes = require("./routes/reportsRoutes");

// Use routes
app.use("/api/facts", factsRoutes);
app.use("/api/jokes", jokesRoutes);
app.use("/api/recipies", recipiesRoutes);
app.use("/api/reports", reportsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
