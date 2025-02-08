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

// Import products data from the external JSON file
const products = require('./products.json');

// GET /products endpoint with optional limit query parameter
app.get('/api/products', (req, res) => {
  const limit = parseInt(req.query.limit, 10);

  // If limit is not provided or invalid, return all products
  if (isNaN(limit) || limit < 1) {
    return res.json(products);
  }

  // Otherwise, return only the first "limit" number of products
  res.json(products.slice(0, limit));
});

// GET /products/:id endpoint to fetch a single product by id
app.get('/api/products/:id', (req, res) => {
  // Parse the id from the URL parameters to an integer
  const id = parseInt(req.params.id, 10);

  // Search for the product with the given id
  const product = products.find(p => p.id === id);

  if (product) {
    // Return the product if found
    res.json(product);
  } else {
    // If not found, send a 404 response with an error message
    res.status(404).json({ error: 'Product not found' });
  }
});

// GET /products/specialty/:specialty endpoint to fetch all products by specialty
app.get('/api/products/specialty/:specialty', (req, res) => {
  // Retrieve the specialty from the route parameters
  const specialtyParam = req.params.specialty.toLowerCase();

  // Filter products where the specialty matches the provided parameter (case-insensitive)
  const filteredProducts = products.filter(product => 
    product.specialty.toLowerCase() === specialtyParam
  );

  // If any products were found, return them; otherwise, send a 404 response
  if (filteredProducts.length > 0) {
    res.json(filteredProducts);
  } else {
    res.status(404).json({ error: 'No products found with the given specialty' });
  }
});

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

// Always export the app for Vercel
module.exports = app;

// For local development, run the server if not deployed on Vercel
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
