import express, { json } from "express";
import cors from "cors";
import { schemaInit } from "./db/conn.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

schemaInit();

// Import routes
import factsRoutes from "./routes/factsRoutes.js";
import jokesRoutes from "./routes/jokesRoutes.js";
import recipesRoutes from "./routes/recipesRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";

// Use routes
app.use("/api/facts", factsRoutes);
app.use("/api/jokes", jokesRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/content", contentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
