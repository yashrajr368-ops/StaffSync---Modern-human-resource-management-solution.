const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./db');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');

dotenv.config();

const seedData = async (shouldExit = true) => {
  try {
    console.log('🌱 Starting StaffSync Data Seeding...');

    // Clear old data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Training.deleteMany({});
    await Announcement.deleteMany({});

    console.log('🧹 Existing collections cleared.');

    // 1. Create HR Administrator
    const hrAdmin = await User.create({
      name: 'Eleanor Vance',
      email: 'hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      employeeId: 'EMP-1001',
      department: 'Human Resources',
      designation: 'Head of People & Culture',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Tech District',
      salary: 95000,
      status: 'Active',
      leaveBalance: { annual: 20, casual: 10, sick: 10 },
    });

    // 2. Create Managers
    const engManager = await User.create({
      name: 'Marcus Chen',
      email: 'manager.eng@staffsync.com',
      password: 'password123',
      role: 'manager',
      employeeId: 'EMP-1002',
      department: 'Engineering',
      designation: 'Engineering VP & Lead',
      phone: '+1 (555) 345-6789',
      address: '108 Silicon Valley Blvd, Bay Area',
      salary: 120000,
      status: 'Active',
      leaveBalance: { annual: 18, casual: 8, sick: 8 },
    });

    const mktManager = await User.create({
      name: 'Sophia Rodriguez',
      email: 'manager.mkt@staffsync.com',
      password: 'password123',
      role: 'manager',
      employeeId: 'EMP-1003',
      department: 'Marketing',
      designation: 'Director of Growth Marketing',
      phone: '+1 (555) 456-7890',
      address: '450 Madison Avenue, Media Hub',
      salary: 105000,
      status: 'Active',
      leaveBalance: { annual: 16, casual: 10, sick: 8 },
    });

    // 3. Create Employees
    const emp1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.dev@staffsync.com',
      password: 'password123',
      role: 'employee',
      employeeId: 'EMP-1004',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      phone: '+1 (555) 567-8901',
      address: '88 Cyber Way, Austin TX',
      salary: 88000,
      manager: engManager._id,
      status: 'Active',
      leaveBalance: { annual: 12, casual: 7, sick: 6 },
    });

    const emp2 = await User.create({
      name: 'David Kim',
      email: 'david.qa@staffsync.com',
      password: 'password123',
      role: 'employee',
      employeeId: 'EMP-1005',
      department: 'Engineering',
      designation: 'QA Automation Engineer',
      phone: '+1 (555) 678-9012',
      address: '124 Debug Lane, Seattle WA',
      salary: 76000,
      manager: engManager._id,
      status: 'Active',
      leaveBalance: { annual: 14, casual: 9, sick: 8 },
    });

    const emp3 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.ui@staffsync.com',
      password: 'password123',
      role: 'employee',
      employeeId: 'EMP-1006',
      department: 'Design',
      designation: 'Lead UI/UX Designer',
      phone: '+1 (555) 789-0123',
      address: '320 Creative Plaza, Brooklyn NY',
      salary: 82000,
      manager: mktManager._id,
      status: 'Active',
      leaveBalance: { annual: 10, casual: 5, sick: 5 },
    });

    const emp4 = await User.create({
      name: 'Emma Watson',
      email: 'emma.sales@staffsync.com',
      password: 'password123',
      role: 'employee',
      employeeId: 'EMP-1007',
      department: 'Sales',
      designation: 'Enterprise Account Executive',
      phone: '+1 (555) 890-1234',
      address: '500 Commerce Towers, Chicago IL',
      salary: 85000,
      manager: mktManager._id,
      status: 'Active',
      leaveBalance: { annual: 15, casual: 10, sick: 8 },
    });

    console.log('👥 Employees created successfully.');

    // 4. Seed Attendance Records
    const today = new Date();
    const todayMorning9 = new Date(today);
    todayMorning9.setHours(9, 5, 0, 0);

    const todayClockOut5 = new Date(today);
    todayClockOut5.setHours(17, 30, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(9, 0, 0, 0);

    const yesterdayOut = new Date(yesterday);
    yesterdayOut.setHours(17, 15, 0, 0);

    await Attendance.create([
      // Today Attendance
      {
        user: alexDevId = emp1._id,
        date: new Date(today.setHours(0, 0, 0, 0)),
        clockIn: todayMorning9,
        status: 'Present',
        totalHours: 0,
        notes: 'Clocked in on time via Web Portal',
      },
      {
        user: emp2._id,
        date: new Date(today.setHours(0, 0, 0, 0)),
        clockIn: new Date(new Date().setHours(9, 45, 0, 0)),
        status: 'Late',
        totalHours: 0,
        notes: 'Late arrival - transit delay',
      },
      {
        user: emp3._id,
        date: new Date(today.setHours(0, 0, 0, 0)),
        clockIn: new Date(new Date().setHours(8, 55, 0, 0)),
        status: 'Present',
        totalHours: 0,
        notes: 'On-time arrival',
      },
      {
        user: hrAdmin._id,
        date: new Date(today.setHours(0, 0, 0, 0)),
        clockIn: new Date(new Date().setHours(8, 45, 0, 0)),
        status: 'Present',
        totalHours: 0,
        notes: 'Executive check-in',
      },
      // Yesterday Attendance (Completed)
      {
        user: emp1._id,
        date: new Date(yesterday.setHours(0, 0, 0, 0)),
        clockIn: yesterday,
        clockOut: yesterdayOut,
        totalHours: 8.25,
        status: 'Present',
        notes: 'Full day shift',
      },
      {
        user: emp2._id,
        date: new Date(yesterday.setHours(0, 0, 0, 0)),
        clockIn: yesterday,
        clockOut: yesterdayOut,
        totalHours: 8.25,
        status: 'Present',
      },
    ]);

    console.log('⏰ Attendance logs seeded.');

    // 5. Seed Leave Applications
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

    await Leave.create([
      {
        user: emp1._id,
        leaveType: 'annual',
        startDate: nextWeek,
        endDate: nextWeekEnd,
        daysCount: 3,
        reason: 'Family vacation and personal travel',
        status: 'Pending',
      },
      {
        user: emp3._id,
        leaveType: 'sick',
        startDate: new Date(today.setDate(today.getDate() + 1)),
        endDate: new Date(today.setDate(today.getDate() + 2)),
        daysCount: 1,
        reason: 'Scheduled dental procedure',
        status: 'Pending',
      },
      {
        user: emp2._id,
        leaveType: 'casual',
        startDate: new Date(yesterday.setDate(yesterday.getDate() - 5)),
        endDate: new Date(yesterday.setDate(yesterday.getDate() + 1)),
        daysCount: 2,
        reason: 'Attended regional developer conference',
        status: 'Approved',
        reviewedBy: engManager._id,
        reviewComment: 'Approved. Great opportunity for team upskilling.',
        reviewedAt: new Date(),
      },
      {
        user: emp4._id,
        leaveType: 'casual',
        startDate: new Date(yesterday.setDate(yesterday.getDate() - 10)),
        endDate: new Date(yesterday.setDate(yesterday.getDate() + 1)),
        daysCount: 1,
        reason: 'Relocation errands',
        status: 'Rejected',
        reviewedBy: mktManager._id,
        reviewComment: 'End-of-quarter client review meetings scheduled. Please re-schedule.',
        reviewedAt: new Date(),
      },
    ]);

    console.log('📅 Leave records seeded.');

    // 6. Seed Training Programs
    const trainingEnd1 = new Date();
    trainingEnd1.setDate(trainingEnd1.getDate() + 21);

    const trainingEnd2 = new Date();
    trainingEnd2.setDate(trainingEnd2.getDate() + 14);

    await Training.create([
      {
        title: 'Modern Full-Stack MERN Architecture & Microservices',
        description:
          'Deep dive into modern React hooks, Express best practices, MongoDB aggregation pipelines, and secure JWT authentication workflows.',
        category: 'Technical Skills',
        trainer: 'Marcus Chen (VP of Eng)',
        durationHours: 24,
        startDate: new Date(),
        endDate: trainingEnd1,
        createdBy: engManager._id,
        assignedTo: [
          {
            user: emp1._id,
            status: 'In-Progress',
            progress: 65,
            feedback: 'Excellent modules on MongoDB indexing and React state management.',
          },
          {
            user: emp2._id,
            status: 'Enrolled',
            progress: 25,
            feedback: 'Setting up automated testing suites.',
          },
        ],
        materialsUrl: 'https://docs.staffsync.internal/mern-mastery',
        status: 'Active',
      },
      {
        title: 'ISO 27001 Information Security & Workplace Privacy Compliance',
        description:
          'Mandatory annual organizational compliance course covering data security, customer PII handling, phishing prevention, and safe authentication practices.',
        category: 'Compliance & Safety',
        trainer: 'Eleanor Vance (Head of HR)',
        durationHours: 6,
        startDate: new Date(),
        endDate: trainingEnd2,
        createdBy: hrAdmin._id,
        assignedTo: [
          {
            user: emp1._id,
            status: 'Completed',
            progress: 100,
            completedAt: new Date(),
            feedback: 'Completed compliance quiz with 98% score.',
          },
          {
            user: emp3._id,
            status: 'In-Progress',
            progress: 50,
          },
          {
            user: emp4._id,
            status: 'In-Progress',
            progress: 40,
          },
        ],
        materialsUrl: 'https://compliance.staffsync.internal/iso27001',
        status: 'Active',
      },
      {
        title: 'High-Impact Product Design & Design Systems (Figma to Code)',
        description:
          'Mastering component-driven development, accessibility standards (WCAG AAA), and design tokens for enterprise HR platforms.',
        category: 'Soft Skills & Productivity',
        trainer: 'Sophia Rodriguez',
        durationHours: 12,
        startDate: new Date(),
        endDate: trainingEnd1,
        createdBy: mktManager._id,
        assignedTo: [
          {
            user: emp3._id,
            status: 'In-Progress',
            progress: 80,
            feedback: 'Refining our Bootstrap design tokens and typography hierarchy.',
          },
        ],
        materialsUrl: 'https://figma.com/@staffsync-design-system',
        status: 'Active',
      },
    ]);

    console.log('🎓 Training programs seeded.');

    // 7. Seed Announcements
    await Announcement.create([
      {
        title: 'Welcome to StaffSync 2.0 - Centralized HR & Workforce Portal',
        content:
          'We are proud to introduce StaffSync, our modern Human Resource Management platform. Employees can now easily punch in daily attendance, track real-time leave balances, apply for time off, and access team training courses. HR and Managers have real-time dashboards to review operations.',
        category: 'General',
        priority: 'High',
        targetDepartment: 'All',
        author: hrAdmin._id,
        isActive: true,
      },
      {
        title: 'Annual Open Enrollment for Health, Dental & Wellness Benefits',
        content:
          'The window for selecting and revising your healthcare, mental wellness stipends, and retirement plans for the upcoming fiscal year is now open until the 15th of next month. Please review the updated benefit brochure in the resource library.',
        category: 'Policy Update',
        priority: 'Critical',
        targetDepartment: 'All',
        author: hrAdmin._id,
        isActive: true,
      },
      {
        title: 'Upcoming All-Hands Meeting & Q4 Innovation Awards',
        content:
          'Join us this Friday at 3:00 PM EST for our quarterly company-wide All-Hands. Leadership will share key milestone achievements, recognize employee of the quarter winners, and provide a sneak preview of the next product roadmap.',
        category: 'Event',
        priority: 'Medium',
        targetDepartment: 'All',
        author: hrAdmin._id,
        isActive: true,
      },
    ]);

    console.log('📢 Announcements seeded.');
    console.log('🎉 Seeding successfully completed!');

    if (shouldExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

// If run directly via command line
if (require.main === module) {
  connectDB().then(() => seedData(true));
}

module.exports = seedData;
