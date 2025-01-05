const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priceRange: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
  },
  ratingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalRatings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  openAllDays: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sameHoursAllDays: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  closedDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  // workingHours now stored as JSONB:
  // Example format: { openAllDays: true, sameHoursAllDays: true, allDays: {start:'09:00',end:'18:00'}, specific: {...}, closedDays: [...] }
  workingHours: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'delete_requested'),
    allowNull: false,
    defaultValue: 'pending',
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mapLocation: {
    type: DataTypes.JSONB, // { lat: number, lng: number }
    allowNull: true,
  },
  notices: {
    type: DataTypes.ARRAY(DataTypes.TEXT), // array of strings
    allowNull: true,
  },
  menu: {
    type: DataTypes.JSONB, // [{name:"Burger", price:5}, ...]
    allowNull: true,
  },
  galleryImages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
});

module.exports = Restaurant;
