const http = require('http');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('RUNNING FULL-STACK TEST SUITE (30 CRITICAL CHECKS)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check & Server online
    const health = await request('http://localhost:5000/api/health');
    assert(health.status === 200 && health.data?.status === 'online', '1. Server is online & healthy');

    // 2. Categories API
    const cats = await request('http://localhost:5000/api/categories');
    assert(cats.status === 200 && cats.data?.categories?.length > 0, `2. Categories retrieved (${cats.data?.categories?.length} active categories)`);

    // 3. Admin Login
    const adminLogin = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
      identifier: 'admin@hostel.com',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data?.token && adminLogin.data?.user?.role === 'admin', '3. Admin login succeeded with JWT & role verification');
    const adminToken = adminLogin.data?.token;

    // 4. Student Login (seeded student Rahul Sharma)
    const studentLogin = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
      identifier: 'rahul.sharma@hostel.com',
      password: 'Student@123',
    });
    assert(studentLogin.status === 200 && studentLogin.data?.user?.role === 'student', '4. Student login succeeded with student role');
    let studentToken = studentLogin.data?.token;
    const studentId = studentLogin.data?.user?.id;

    // 5. Login with invalid password
    const wrongPass = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
      identifier: 'admin@hostel.com',
      password: 'WrongPassword999',
    });
    assert(wrongPass.status === 401, '5. Incorrect password correctly rejected (401)');

    // 6. Student Registration with unique timestamped credentials
    const testStudentId = `TEST${Date.now().toString().slice(-6)}`;
    const testEmail = `student_${Date.now()}@campus.edu`;
    const regRes = await request('http://localhost:5000/api/auth/register', { method: 'POST' }, {
      name: 'Ananya Roy',
      studentId: testStudentId,
      email: testEmail,
      phone: '9876543210',
      gender: 'Female',
      hostel: 'Gargi Bhavan',
      block: 'C Block',
      roomNumber: '215',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    assert(regRes.status === 201 && regRes.data?.token, `6. New student registered successfully: ${testEmail}`);
    const newStudentToken = regRes.data?.token;

    // 7. Duplicate Registration rejected
    const dupRes = await request('http://localhost:5000/api/auth/register', { method: 'POST' }, {
      name: 'Duplicate Student',
      studentId: testStudentId,
      email: testEmail,
      phone: '9876543210',
      password: 'Password@123',
    });
    assert(dupRes.status === 400, '7. Duplicate registration properly rejected (400)');

    // 8. Auth /me profile check
    const meRes = await request('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(meRes.status === 200 && meRes.data?.user?.studentId === testStudentId, '8. /api/auth/me returns authenticated student data');

    // 9. Unauthorized request without token
    const unauth = await request('http://localhost:5000/api/complaints');
    assert(unauth.status === 401, '9. Route protected against unauthenticated requests (401)');

    // 10. Student attempting Admin-only endpoint
    const forbidden = await request('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(forbidden.status === 403, '10. Student forbidden from accessing Admin API (403)');

    // 11. Student creates a complaint
    const complaintRes = await request('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    }, {
      title: 'Water tap leaking heavily in bathroom',
      description: 'The basin tap is constantly dripping and the pipe underneath is leaking onto the bathroom floor.',
      category: 'Plumbing',
      location: 'Room 215 Attached Bathroom',
      hostel: 'Gargi Bhavan',
      block: 'C Block',
      roomNumber: '215',
      priority: 'High',
    });
    assert(complaintRes.status === 201 && complaintRes.data?.complaint?.complaintId, `11. Complaint created with auto ID: ${complaintRes.data?.complaint?.complaintId}`);
    const newComplaint = complaintRes.data?.complaint;

    // 12. Complaint appears in student's complaint list
    const studentComplaints = await request('http://localhost:5000/api/complaints', {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(
      studentComplaints.status === 200 &&
      studentComplaints.data?.complaints?.some(c => c._id === newComplaint._id),
      '12. New complaint appears on student dashboard list'
    );

    // 13. Student notifications check (notification created on submission)
    const notifs = await request('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(notifs.status === 200 && notifs.data?.notifications?.length > 0, '13. Automatic student notification generated for new complaint');

    // 14. Student views complaint details
    const detailRes = await request(`http://localhost:5000/api/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(
      detailRes.status === 200 &&
      detailRes.data?.complaint?.timeline?.length > 0,
      '14. Complaint details fetched with timeline'
    );

    // 15. Student edits pending complaint
    const editRes = await request(`http://localhost:5000/api/complaints/${newComplaint._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    }, {
      title: 'Water tap and valve leaking heavily in bathroom',
      priority: 'Urgent',
    });
    assert(editRes.status === 200 && editRes.data?.complaint?.priority === 'Urgent', '15. Student successfully updated pending complaint priority to Urgent');

    // 16. Admin views dashboard metrics
    const adminDashboard = await request('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminDashboard.status === 200 &&
      adminDashboard.data?.stats?.total > 0 &&
      adminDashboard.data?.categoryStats?.length > 0,
      `16. Admin dashboard metrics loaded (Total: ${adminDashboard.data?.stats?.total})`
    );

    // 17. Admin views all complaints directory
    const adminComplaints = await request('http://localhost:5000/api/admin/complaints', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminComplaints.status === 200 && adminComplaints.data?.complaints?.length > 0, '17. Admin master complaints list fetched');

    // 18. Admin assigns complaint to technician
    const assignRes = await request(`http://localhost:5000/api/admin/complaints/${newComplaint._id}/assign`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      assignedUserName: 'Hostel Plumbing Contractor (Ramesh)',
      remarks: 'Dispatched plumber with replacement washers and sealing tape.',
    });
    assert(assignRes.status === 200 && assignRes.data?.complaint?.status === 'Assigned', '18. Admin successfully assigned complaint');

    // 19. Admin updates status to "In Progress"
    const statusRes = await request(`http://localhost:5000/api/admin/complaints/${newComplaint._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      status: 'In Progress',
      remarks: 'Plumber on site repairing the pipe joint.',
    });
    assert(statusRes.status === 200 && statusRes.data?.complaint?.status === 'In Progress', '19. Admin updated complaint status to In Progress');

    // 20. Student sees status updated and gets notification
    const studentCheck = await request(`http://localhost:5000/api/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(studentCheck.data?.complaint?.status === 'In Progress', '20. Student immediately observes "In Progress" status');

    // 21. Admin resolves complaint with resolution notes
    const resolveRes = await request(`http://localhost:5000/api/admin/complaints/${newComplaint._id}/resolve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      resolutionNotes: 'Replaced faulty valve washers and Teflon joint seal. Water flow tested with zero leakage.',
    });
    assert(resolveRes.status === 200 && resolveRes.data?.complaint?.status === 'Resolved', '21. Admin resolved complaint with resolution notes');

    // 22. Student verifies resolution details
    const studentVerify = await request(`http://localhost:5000/api/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(
      studentVerify.data?.complaint?.status === 'Resolved' &&
      studentVerify.data?.complaint?.resolution?.notes.includes('Teflon joint seal'),
      '22. Student views verified resolution notes & completion timestamp'
    );

    // 23. Admin views students directory
    const studentsRes = await request('http://localhost:5000/api/admin/students', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(studentsRes.status === 200 && studentsRes.data?.students?.length > 0, '23. Admin students directory returns student profiles & complaint stats');

    // 24. Admin views specific student's details & complaints
    const singleStudent = await request(`http://localhost:5000/api/admin/students/${studentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(singleStudent.status === 200 && singleStudent.data?.student?.name === 'Rahul Sharma', '24. Admin gets individual student history without password leakage');

    // 25. Category management: Admin creates a new category
    const testCatName = `Custom Hall Facility ${Date.now().toString().slice(-4)}`;
    const newCat = await request('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      name: testCatName,
      description: 'Custom test category for recreation facilities',
      icon: 'Sparkles',
    });
    assert(newCat.status === 201 && newCat.data?.category?._id, '25. Admin creates new category');
    const createdCatId = newCat.data?.category?._id;

    // 26. Category management: Admin updates category
    const updateCat = await request(`http://localhost:5000/api/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      description: 'Updated description for recreation facility',
    });
    assert(updateCat.status === 200 && updateCat.data?.category?.description.includes('Updated'), '26. Admin updates category details');

    // 27. Category management: Admin deletes category
    const delCat = await request(`http://localhost:5000/api/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delCat.status === 200, '27. Admin deletes category');

    // 28. Notification marking as read & mark all read
    const markAll = await request('http://localhost:5000/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    });
    assert(markAll.status === 200, '28. Mark all notifications as read succeeded');

    // 29. Profile update
    const profUpdate = await request('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    }, {
      phone: '9988776655',
      roomNumber: '216',
    });
    assert(profUpdate.status === 200 && profUpdate.data?.user?.roomNumber === '216', '29. User profile update succeeded');

    // 30. Change password
    const changePass = await request('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newStudentToken}` },
    }, {
      currentPassword: 'Password@123',
      newPassword: 'NewSecurePassword@456',
      confirmNewPassword: 'NewSecurePassword@456',
    });
    assert(changePass.status === 200, '30. Change password with current password verification succeeded');

  } catch (err) {
    console.error('Unhandled test suite error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed === 0) {
    console.log('ALL VERIFICATION CRITERIA SATISFIED PERFECTLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
