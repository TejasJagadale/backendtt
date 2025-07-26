const express = require("express");
const router = express.Router();
const createContentModel = require("../models/Content");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

const categories = [
  "Technology",
  "Business",
  "Science",
  "Environment",
  "Health",
  "Entertainment",
  "Sports",
  "Education"
];

router.post("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    if (!categories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    console.log("Incoming data:", req.body); // Add this line

    const Content = createContentModel(category);
    const newContent = new Content(req.body);
    const savedContent = await newContent.save();

    console.log("Saved content:", savedContent); // Add this line

    res.status(201).json(savedContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET endpoint for specific category
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    if (!categories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const Content = createContentModel(category);
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this to your existing contentRoutes.js
router.get('/article/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = [
      'Technology', 'Business', 'Science', 'Environment',
      'Health', 'Entertainment', 'Sports', 'Education'
    ];

    let foundArticle = null;
    
    // Search through each category
    for (const category of categories) {
      const Content = createContentModel(category);
      const article = await Content.findOne({ _id: id });
      if (article) {
        foundArticle = article.toObject();
        foundArticle.category = category;
        break;
      }
    }

    if (foundArticle) {
      res.json(foundArticle);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
