const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide training program title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    category: {
      type: String,
      enum: [
        'Technical Skills',
        'Leadership & Management',
        'Compliance & Safety',
        'Customer Service',
        'Soft Skills & Productivity',
        'Product & Architecture',
      ],
      default: 'Technical Skills',
    },
    trainer: {
      type: String,
      default: 'Internal HR / Lead',
    },
    durationHours: {
      type: Number,
      default: 10,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['Enrolled', 'In-Progress', 'Completed'],
          default: 'Enrolled',
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedAt: {
          type: Date,
        },
        feedback: {
          type: String,
          default: '',
        },
      },
    ],
    materialsUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
