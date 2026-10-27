const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['hr', 'manager', 'employee', 'admin'],
      default: 'employee',
      lowercase: true,
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      enum: [
        'Engineering',
        'Human Resources',
        'Marketing',
        'Sales',
        'Finance',
        'Operations',
        'Design',
        'Support',
      ],
      default: 'Engineering',
    },
    designation: {
      type: String,
      default: 'Associate',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    address: {
      type: String,
      default: '123 Innovation Way, Tech Park',
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 65000,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    leaveBalance: {
      annual: { type: Number, default: 15 },
      casual: { type: Number, default: 10 },
      sick: { type: Number, default: 8 },
    },
    status: {
      type: String,
      enum: ['Active', 'On-Leave', 'Inactive'],
      default: 'Active',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
