const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: { type: String, required: true }, // e.g. "Class 10"
  section: { type: String, required: true }    // e.g. "A"
});

module.exports = mongoose.model('Class', ClassSchema);