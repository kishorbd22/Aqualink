/**
 * Aqualink - Models
 *
 * Sequelize model loader.
 *
 * This loader automatically discovers and registers all model files
 * placed in this directory. Each model file must export a function
 * with the signature: (sequelize, DataTypes) => ModelClass.
 *
 * Usage:
 *   const { sequelize, models } = require('./models');
 *   // models will contain all registered models once they are created
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../database');
const { DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const models = {};

// Auto-discover and load all model files in this directory
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&          // not hidden
      file !== basename &&                  // not this index file
      file.slice(-3) === '.js' &&           // JavaScript only
      file.indexOf('.test.js') === -1       // not test files
    );
  })
  .forEach((file) => {
    const modelFactory = require(path.join(__dirname, file));
    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, DataTypes);
      models[model.name] = model;
      console.log(`  ✓ Model loaded: ${model.name}`);
    }
  });

// Run associations — each model can define an associate(models) static method
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models);
    console.log(`  ✓ Associations set up for: ${modelName}`);
  }
});

module.exports = { sequelize, models };