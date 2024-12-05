const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
