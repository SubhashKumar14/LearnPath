const http = require('http');

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCertificateFlow() {
  console.log('🧪 Testing Certificate Flow...\n');
  
  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (loginResult.status === 200) {
      console.log('✅ Login successful');
      const token = loginResult.data.token;
      
      // Test 2: Get courses
      console.log('2. Getting courses...');
      const coursesResult = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/courses',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (coursesResult.status === 200 && coursesResult.data.length > 0) {
        console.log(`✅ Found ${coursesResult.data.length} courses`);
        const courseId = coursesResult.data[0].id;
        const courseTitle = coursesResult.data[0].title;
        console.log(`   Testing with course: ${courseTitle} (ID: ${courseId})`);
        
        // Test 3: Get course details and tasks
        console.log('3. Getting course details...');
        const courseDetailResult = await makeRequest({
          hostname: 'localhost',
          port: 3000,
          path: `/api/courses/${courseId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (courseDetailResult.status === 200) {
          console.log('✅ Course details loaded');
          const course = courseDetailResult.data;
          let totalTasks = 0;
          
          // Count total tasks
          for (const module of course.modules) {
            totalTasks += module.tasks.length;
          }
          console.log(`   Course has ${totalTasks} tasks across ${course.modules.length} modules`);
          
          // Test 4: Complete all tasks
          console.log('4. Completing all tasks...');
          let completedTasks = 0;
          for (const module of course.modules) {
            for (const task of module.tasks) {
              const completeResult = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/progress/complete-task',
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }, {
                taskId: task.id
              });
              
              if (completeResult.status === 200) {
                completedTasks++;
              } else {
                console.log(`   ⚠️ Failed to complete task ${task.id}: ${completeResult.data.error || 'Unknown error'}`);
              }
            }
          }
          console.log(`✅ Completed ${completedTasks}/${totalTasks} tasks`);
          
          // Test 5: Check course progress
          console.log('5. Checking course progress...');
          const progressResult = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/progress/my-progress',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (progressResult.status === 200) {
            console.log('✅ Progress data loaded');
            const progress = progressResult.data;
            const courseProgress = progress.courses?.find(c => c.course_id == courseId);
            if (courseProgress) {
              console.log(`   Course progress: ${courseProgress.progress}%`);
            }
          }
          
          // Test 6: Generate certificate
          console.log('6. Generating certificate...');
          const certResult = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/api/courses/${courseId}/certificate`,
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (certResult.status === 200) {
            console.log('✅ Certificate generated successfully');
            console.log(`   Certificate ID: ${certResult.data.certificateId}`);
            console.log(`   Student: ${certResult.data.studentName}`);
            console.log(`   Course: ${certResult.data.courseTitle}`);
            
            // Test 7: Get certificates list
            console.log('7. Getting certificates list...');
            const certsListResult = await makeRequest({
              hostname: 'localhost',
              port: 3000,
              path: '/api/certificates',
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (certsListResult.status === 200) {
              console.log(`✅ Certificates list loaded (${certsListResult.data.length} certificates)`);
              
              // Test 8: Get specific certificate
              console.log('8. Testing certificate details...');
              const certDetailResult = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: `/api/certificates/${certResult.data.certificateId}`,
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (certDetailResult.status === 200) {
                console.log('✅ Certificate details loaded');
                console.log('🎉 All tests passed! Certificate system is working correctly.');
                console.log(`\n📋 Summary:`);
                console.log(`   - Login: ✅`);
                console.log(`   - Course loading: ✅`);
                console.log(`   - Task completion: ✅ (${completedTasks}/${totalTasks})`);
                console.log(`   - Certificate generation: ✅`);
                console.log(`   - Certificate retrieval: ✅`);
                console.log(`\n🔗 Certificate URL: http://localhost:3000/certificate.html?id=${certResult.data.certificateId}`);
              } else {
                console.log(`❌ Certificate details failed: ${certDetailResult.data.error || 'Unknown error'}`);
              }
            } else {
              console.log(`❌ Certificates list failed: ${certsListResult.data.error || 'Unknown error'}`);
            }
          } else {
            console.log(`❌ Certificate generation failed: ${certResult.data.error || 'Unknown error'}`);
          }
        } else {
          console.log(`❌ Course details failed: ${courseDetailResult.data.error || 'Unknown error'}`);
        }
      } else {
        console.log(`❌ Courses failed: ${coursesResult.data.error || 'No courses found'}`);
      }
    } else {
      console.log(`❌ Login failed: ${loginResult.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCertificateFlow();