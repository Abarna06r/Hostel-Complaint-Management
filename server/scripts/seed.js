const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

dotenv.config();

const defaultCategories = [
  {
    name: 'Electrical',
    description: 'Issues with lighting, ceiling fans, power sockets, switches, or MCB trip.',
    icon: 'Zap',
    isActive: true,
  },
  {
    name: 'Plumbing',
    description: 'Leakages, water supply disruption, damaged taps, valves, and pipe repairs.',
    icon: 'Droplets',
    isActive: true,
  },
  {
    name: 'Room Maintenance',
    description: 'Door locks, keys, broken window panes, wall seepage, or cupboard hinges.',
    icon: 'Wrench',
    isActive: true,
  },
  {
    name: 'Washroom & Hygiene',
    description: 'Clogged drainage, geyser repair, broken flush, sanitary fixtures, and tiles.',
    icon: 'Bath',
    isActive: true,
  },
  {
    name: 'Wi-Fi & Network',
    description: 'LAN port faults, campus Wi-Fi authentication, dead zones, and slow speed.',
    icon: 'Wifi',
    isActive: true,
  },
  {
    name: 'Cleaning & Housekeeping',
    description: 'Room cleaning requests, garbage collection, pest infestation, and corridor sweep.',
    icon: 'Sparkles',
    isActive: true,
  },
  {
    name: 'Furniture & Fixtures',
    description: 'Damaged study table, broken chairs, bed frame repairs, and book rack damage.',
    icon: 'Armchair',
    isActive: true,
  },
  {
    name: 'Mess & Drinking Water',
    description: 'RO water purifier filter failure, water cooler cooling, and mess food concerns.',
    icon: 'UtensilsCrossed',
    isActive: true,
  },
  {
    name: 'Security & Safety',
    description: 'Emergency exit access, corridor night lamps, lock security, and stray animal alerts.',
    icon: 'ShieldAlert',
    isActive: true,
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_complaints';
    console.log(`[Seed Script]: Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed Script]: MongoDB Connected Successfully!');

    // 1. Seed Categories
    console.log('[Seed Script]: Seeding complaint categories...');
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`  + Category added: ${cat.name}`);
      }
    }

    // 2. Check / Seed Admin
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('[Seed Script]: Creating default Admin account...');
      admin = await User.create({
        name: 'Chief Hostel Warden',
        email: 'admin@hostel.com',
        studentId: 'ADMIN-001',
        phone: '+91 9876543210',
        gender: 'Male',
        hostel: 'Central Warden Office',
        block: 'Admin',
        roomNumber: 'W-01',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('  + Admin created: admin@hostel.com (Password: Admin@123)');
    } else {
      console.log(`[Seed Script]: Admin account already exists: ${admin.email}`);
    }

    // 3. Check / Seed Sample Students
    let student1 = await User.findOne({ email: 'rahul.sharma@hostel.com' });
    if (!student1) {
      console.log('[Seed Script]: Creating sample students for testing...');
      student1 = await User.create({
        name: 'Rahul Sharma',
        studentId: 'STU2024001',
        email: 'rahul.sharma@hostel.com',
        phone: '+91 9811223344',
        gender: 'Male',
        hostel: 'Aryabhatta Hall',
        block: 'B Block',
        roomNumber: '302',
        password: 'Student@123',
        role: 'student',
      });

      const student2 = await User.create({
        name: 'Priya Patel',
        studentId: 'STU2024002',
        email: 'priya.patel@hostel.com',
        phone: '+91 9822334455',
        gender: 'Female',
        hostel: 'Gargi Bhavan',
        block: 'A Block',
        roomNumber: '114',
        password: 'Student@123',
        role: 'student',
      });

      const student3 = await User.create({
        name: 'Amit Verma',
        studentId: 'STU2024003',
        email: 'amit.verma@hostel.com',
        phone: '+91 9833445566',
        gender: 'Male',
        hostel: 'Aryabhatta Hall',
        block: 'C Block',
        roomNumber: '205',
        password: 'Student@123',
        role: 'student',
      });
      console.log('  + 3 Sample Students created (Password: Student@123)');

      // 4. Seed Sample Complaints with realistic statuses and histories
      console.log('[Seed Script]: Seeding realistic complaints...');

      // Complaint 1: Urgent - In Progress
      const c1 = await Complaint.create({
        title: 'Ceiling Fan Sparking & Burning Smell',
        description: 'The ceiling fan regulator started producing sparks when switched on and there is an intense burning odor in the room.',
        category: 'Electrical',
        location: 'Bedroom Ceiling',
        hostel: 'Aryabhatta Hall',
        block: 'B Block',
        roomNumber: '302',
        priority: 'Urgent',
        status: 'In Progress',
        submittedBy: student1._id,
        assignedTo: {
          user: admin._id,
          name: 'Chief Hostel Warden',
          assignedAt: new Date(Date.now() - 24 * 3600 * 1000),
        },
        adminRemarks: 'Electrician dispatched with spare regulator and motor coil inspection.',
        timeline: [
          {
            status: 'Pending',
            remarks: 'Complaint registered by student',
            updatedBy: student1._id,
            updatedByName: student1.name,
            timestamp: new Date(Date.now() - 26 * 3600 * 1000),
          },
          {
            status: 'Assigned',
            remarks: 'Assigned to Electrician Team',
            updatedBy: admin._id,
            updatedByName: admin.name,
            timestamp: new Date(Date.now() - 24 * 3600 * 1000),
          },
          {
            status: 'In Progress',
            remarks: 'Electrician inspecting wiring in Room 302',
            updatedBy: admin._id,
            updatedByName: admin.name,
            timestamp: new Date(Date.now() - 12 * 3600 * 1000),
          },
        ],
      });

      // Complaint 2: High - Resolved
      const c2 = await Complaint.create({
        title: 'Bathroom Flush Tank Leaking Continuously',
        description: 'The flush mechanism in washroom stall 2 is running non-stop and wasting overhead water supply.',
        category: 'Plumbing',
        location: 'Floor 1 Common Washroom',
        hostel: 'Gargi Bhavan',
        block: 'A Block',
        roomNumber: '114',
        priority: 'High',
        status: 'Resolved',
        submittedBy: student2._id,
        assignedTo: {
          user: admin._id,
          name: 'Chief Hostel Warden',
          assignedAt: new Date(Date.now() - 48 * 3600 * 1000),
        },
        adminRemarks: 'Plumber repaired the syphon valve gasket.',
        resolution: {
          notes: 'Replaced faulty flush inlet valve and syphon rubber washer. Verified zero leakage.',
          resolvedAt: new Date(Date.now() - 6 * 3600 * 1000),
          resolvedBy: admin._id,
        },
        resolvedAt: new Date(Date.now() - 6 * 3600 * 1000),
        timeline: [
          {
            status: 'Pending',
            remarks: 'Complaint submitted by student',
            updatedBy: student2._id,
            updatedByName: student2.name,
            timestamp: new Date(Date.now() - 52 * 3600 * 1000),
          },
          {
            status: 'In Progress',
            remarks: 'Plumbing contractor on site',
            updatedBy: admin._id,
            updatedByName: admin.name,
            timestamp: new Date(Date.now() - 24 * 3600 * 1000),
          },
          {
            status: 'Resolved',
            remarks: 'Replaced faulty valve. System verified.',
            updatedBy: admin._id,
            updatedByName: admin.name,
            timestamp: new Date(Date.now() - 6 * 3600 * 1000),
          },
        ],
      });

      // Complaint 3: Medium - Pending
      const c3 = await Complaint.create({
        title: 'Wi-Fi AP Drop & Frequent Disconnections',
        description: 'The access point outside Room 205 keeps restarting every 10 minutes during evening study hours.',
        category: 'Wi-Fi & Network',
        location: 'Corridor 2nd Floor',
        hostel: 'Aryabhatta Hall',
        block: 'C Block',
        roomNumber: '205',
        priority: 'Medium',
        status: 'Pending',
        submittedBy: student3._id,
        timeline: [
          {
            status: 'Pending',
            remarks: 'Complaint submitted by student',
            updatedBy: student3._id,
            updatedByName: student3.name,
            timestamp: new Date(Date.now() - 3 * 3600 * 1000),
          },
        ],
      });

      // Complaint 4: Low - Pending
      const c4 = await Complaint.create({
        title: 'Study Chair Wheel Damaged',
        description: 'One of the castor wheels on the study chair broke off. The chair wobbles while studying.',
        category: 'Furniture & Fixtures',
        location: 'Room 302 Study Desk',
        hostel: 'Aryabhatta Hall',
        block: 'B Block',
        roomNumber: '302',
        priority: 'Low',
        status: 'Pending',
        submittedBy: student1._id,
        timeline: [
          {
            status: 'Pending',
            remarks: 'Complaint submitted by student',
            updatedBy: student1._id,
            updatedByName: student1.name,
            timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          },
        ],
      });

      // 5. Seed sample notifications
      await Notification.create([
        {
          user: student1._id,
          title: 'Complaint Registered',
          message: `Your complaint "${c1.title}" (${c1.complaintId}) has been registered.`,
          type: 'complaint_created',
          complaint: c1._id,
          isRead: true,
        },
        {
          user: student1._id,
          title: 'Status Updated: In Progress',
          message: `Your complaint "${c1.title}" is now In Progress. Electrician team is checking the room.`,
          type: 'status_updated',
          complaint: c1._id,
          isRead: false,
        },
        {
          user: student2._id,
          title: 'Complaint Resolved',
          message: `Your complaint "${c2.title}" has been successfully resolved.`,
          type: 'resolved',
          complaint: c2._id,
          isRead: false,
        },
        {
          user: admin._id,
          title: 'Urgent Issue Reported',
          message: `New Urgent issue reported in Aryabhatta Hall Room 302: ${c1.title}`,
          type: 'complaint_created',
          complaint: c1._id,
          isRead: false,
        },
      ]);
      console.log('  + Sample complaints and notifications initialized!');
    }

    console.log('\n=============================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('ADMIN LOGIN:');
    console.log('  Email:    admin@hostel.com');
    console.log('  Password: Admin@123');
    console.log('\nSTUDENT LOGIN:');
    console.log('  Email:    rahul.sharma@hostel.com (or STU2024001)');
    console.log('  Password: Student@123');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
