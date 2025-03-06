import express, { json } from "express";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

// Import routes
import factsRoutes from "./routes/factsRoutes.js";
// const jokesRoutes = require("./routes/jokesRoutes");
// const recipiesRoutes = require("./routes/recipiesRoutes");
// const reportsRoutes = require("./routes/reportsRoutes");

// Use routes
app.use("/api/facts", factsRoutes);
// app.use("/api/jokes", jokesRoutes);
// app.use("/api/recipies", recipiesRoutes);
// app.use("/api/reports", reportsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
