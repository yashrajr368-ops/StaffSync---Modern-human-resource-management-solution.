const User = require('../models/User');

// @desc    Get all employees with filtering & search
// @route   GET /api/employees
// @access  Private (All authenticated users can see directory, HR/Manager see sensitive info)
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, role, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    // If user is regular employee, only show active employees or basic directory
    let projection = '-password';
    if (req.user.role === 'employee') {
      projection = '-password -salary';
    }

    const employees = await User.find(query)
      .select(projection)
      .populate('manager', 'name email designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching employees',
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    let projection = '-password';
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      projection = '-password -salary';
    }

    const employee = await User.findById(req.params.id)
      .select(projection)
      .populate('manager', 'name email designation department');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching employee details',
    });
  }
};

// @desc    Create a new employee (HR / Admin only)
// @route   POST /api/employees
// @access  Private (HR, Admin)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'password123',
      role = 'employee',
      department = 'Engineering',
      designation = 'Specialist',
      phone,
      address,
      salary = 50000,
      dateOfJoining,
      manager,
      status = 'Active',
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists',
      });
    }

    const count = await User.countDocuments();
    const employeeId = `EMP-${1000 + count + 1}`;

    const newEmployee = await User.create({
      name,
      email,
      password,
      role: role.toLowerCase(),
      department,
      designation,
      phone: phone || '+1 (555) 000-0000',
      address: address || 'Corporate Headquarters',
      salary,
      dateOfJoining: dateOfJoining || new Date(),
      manager: manager || null,
      status,
      employeeId,
      leaveBalance: {
        annual: 15,
        casual: 10,
        sick: 8,
      },
    });

    const populated = await User.findById(newEmployee._id)
      .select('-password')
      .populate('manager', 'name email');

    res.status(201).json({
      success: true,
      employee: populated,
      message: 'Employee created successfully',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating employee',
    });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (HR, Admin, or Manager for their team)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      name,
      email,
      role,
      department,
      designation,
      phone,
      address,
      salary,
      manager,
      status,
      leaveBalance,
    } = req.body;

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (role && (req.user.role === 'admin' || req.user.role === 'hr')) employee.role = role.toLowerCase();
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (salary && (req.user.role === 'admin' || req.user.role === 'hr')) employee.salary = salary;
    if (manager !== undefined) employee.manager = manager || null;
    if (status) employee.status = status;
    if (leaveBalance && (req.user.role === 'admin' || req.user.role === 'hr')) {
      employee.leaveBalance = { ...employee.leaveBalance, ...leaveBalance };
    }

    await employee.save();

    const updated = await User.findById(employee._id)
      .select('-password')
      .populate('manager', 'name email designation');

    res.status(200).json({
      success: true,
      employee: updated,
      message: 'Employee record updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating employee',
    });
  }
};

// @desc    Delete / Terminate employee
// @route   DELETE /api/employees/:id
// @access  Private (HR, Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Employee ${employee.name} (${employee.employeeId}) removed successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting employee',
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
