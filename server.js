const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Path to the projects.json file
const projectsFilePath = path.join(__dirname, "projects.json");

// Helper functions to read and write the JSON file
function readProjects() {
  const data = fs.readFileSync(projectsFilePath, "utf8");
  return JSON.parse(data);
}

function writeProjects(data) {
  fs.writeFileSync(projectsFilePath, JSON.stringify(data, null, 2), "utf8");
}

// Endpoint to GET all projects
app.get("/projects", (req, res) => {
  try {
    const projects = readProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error reading projects file", error });
  }
});

// Endpoint to POST and modify "likes" for a specific project by ID
app.post("/projects/:id/likes", (req, res) => {
  try {
    const { id } = req.params;
    const projects = readProjects();

    // Find the project by ID
    const project = projects.find((project) => project.id === id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Increment likes
    project.likes += 1;

    // Save the updated projects back to the file
    writeProjects(projects);

    res.json({ message: "Likes updated", project });
  } catch (error) {
    res.status(500).json({ error: "Unable to update likes" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

