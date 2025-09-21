class LearningPlatform {
  constructor(){
    this.courses = [];
    this.currentCourse = null;
    this.apiBase = '/api';
    this.init();
  }
  async init(){
    await auth.init();
    this.setupEventListeners();
    await this.loadCourses();
    utils.showPage('home');
  }
  setupEventListeners(){
    window.showPage = (id)=>{ utils.showPage(id); this.loadPageData(id); };
    window.viewCourse = id => this.viewCourse(id);
    window.enrollInCourse = id => this.enrollInCourse(id);
    window.toggleTask = (taskId, completed) => this.toggleTaskCompletion(taskId, completed);
  }
  async loadPageData(id){
    if (id==='progress' && auth.currentUser) await this.loadProgress();
    if (id==='profile' && auth.currentUser) await this.loadProfile();
  }
  async loadCourses(){
    try {
      const headers = auth.currentUser? { Authorization:`Bearer ${localStorage.getItem('authToken')}` }:{};
      const r = await fetch(`${this.apiBase}/courses`, { headers });
      this.courses = await r.json();
      this.displayCourses();
      this.displayFeaturedCourses();
    } catch { utils.showAlert('Failed to load courses','danger'); }
  }
  displayCourses(){
    const container = document.getElementById('courses-container');
    container.innerHTML = this.courses.map(c=>`
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card course-card h-100" onclick="viewCourse(${c.id})">
          <img src="${c.hero_image || 'https://via.placeholder.com/400x250/4361ee/ffffff?text=Course'}" class="card-img-top" alt="${c.title}">
          <div class="card-body">
            <h5 class="card-title">${c.title}</h5>
            <p class="card-text">${c.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary">${c.difficulty}</span>
              <small class="text-muted"><i class="fas fa-clock me-1"></i>${c.duration}</small>
            </div>
            <div class="mt-2"><small class="text-muted">${c.module_count} modules • ${c.task_count} tasks</small></div>
          </div>
        </div>
      </div>`).join('');
  }
  displayFeaturedCourses(){
    const container = document.getElementById('featured-courses');
    container.innerHTML = this.courses.slice(0,3).map(c=>`
      <div class="col-md-4 mb-4"><div class="card course-card h-100" onclick="viewCourse(${c.id})">
      <img src="${c.hero_image || 'https://via.placeholder.com/400x250/4361ee/ffffff?text=Course'}" class="card-img-top" alt="${c.title}">
      <div class="card-body"><h5 class="card-title">${c.title}</h5><p class="card-text">${c.description}</p><span class="badge bg-primary">${c.difficulty}</span></div></div></div>`).join('');
  }
  async viewCourse(id){
    try {
      const headers = auth.currentUser? { Authorization:`Bearer ${localStorage.getItem('authToken')}` }:{};
      const r = await fetch(`${this.apiBase}/courses/${id}`, { headers });
      this.currentCourse = await r.json();
      this.displayCourseDetail();
      utils.showPage('course-detail');
    } catch { utils.showAlert('Failed to load course details','danger'); }
  }
  displayCourseDetail(){
    const c = this.currentCourse;
    document.getElementById('course-title').textContent = c.title;
    document.getElementById('course-description').textContent = c.description;
    document.getElementById('course-difficulty').textContent = c.difficulty;
    document.getElementById('course-duration').textContent = c.duration;
    const enrollBtn = document.getElementById('enroll-btn');
    if (auth.currentUser){
      enrollBtn.onclick = ()=> this.enrollInCourse(c.id);
      if (c.enrolled){
        enrollBtn.textContent = 'Enrolled';
        enrollBtn.disabled = true;
      } else {
        enrollBtn.textContent = 'Enroll Now';
        enrollBtn.disabled = false;
      }
    } else { 
      enrollBtn.onclick = ()=> utils.showPage('login'); 
      enrollBtn.textContent = 'Login to Enroll'; 
      enrollBtn.disabled = false;
    }
    document.getElementById('course-progress-bar').style.width = `${c.progress||0}%`;
    document.getElementById('course-progress-text').textContent = `${c.progress||0}% Complete`;
    this.displayModules(c.modules||[]);
  }
  displayModules(mods){
    document.getElementById('course-modules').innerHTML = mods.map((m,i)=>`
      <div class="card module-card mb-4">
        <div class="card-header"><h5 class="mb-0"><span class="module-number">${i+1}</span>${m.title}</h5><p class="mb-0 text-muted">${m.description||''}</p></div>
        <div class="card-body p-0">${this.displayTasks(m.tasks||[])}</div>
      </div>`).join('');
  }
  displayTasks(tasks){
    if(!tasks.length) return '<p class="p-3 text-muted">No tasks available</p>';
    return tasks.map(t=>`
      <div class="task-item d-flex align-items-center p-3 border-bottom ${t.completed?'completed':''}">
        <div class="me-3"><input type="checkbox" class="form-check-input" ${t.completed?'checked':''} ${auth.currentUser?`onchange=\"toggleTask(${t.id}, this.checked)\"`:'disabled'}></div>
        <div class="flex-grow-1">
          <h6 class="mb-1 task-title">${t.title}</h6>
          <p class="mb-0 text-muted small">${t.description||''}</p>
          ${t.resource_url?`<a href='${t.resource_url}' target='_blank' class='btn btn-sm btn-outline-primary mt-2'>View Resource</a>`:''}
        </div>
        <span class="badge bg-secondary">${t.task_type}</span>
      </div>`).join('');
  }
  async enrollInCourse(id){
    if(!auth.currentUser) return utils.showPage('login');
    try { const r = await fetch(`${this.apiBase}/courses/${id}/enroll`, { method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('authToken')}` } }); const d = await r.json(); if(r.ok){ utils.showAlert('Enrolled!','success'); document.getElementById('enroll-btn').textContent='Enrolled'; } else utils.showAlert(d.error,'danger'); } catch { utils.showAlert('Enrollment failed','danger'); }
  }
  async toggleTaskCompletion(taskId, completed){
    if(!auth.currentUser) return;
    try {
      const r = await fetch(`${this.apiBase}/progress/task`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('authToken')}` }, body:JSON.stringify({ taskId, completed }) });
      const d = await r.json();
      if (r.ok){
        utils.showAlert(completed ? 'Task completed! 🎉':'Task unchecked','success');
        if (d.progress!==undefined){ 
          document.getElementById('course-progress-bar').style.width = `${d.progress}%`; 
          document.getElementById('course-progress-text').textContent = `${d.progress}% Complete`; 
        }
        if (d.courseCompleted) this.showCertificateModal();
      }
    } catch { utils.showAlert('Failed to update progress','danger'); }
  }
  async loadProgress(){
    try { const r = await fetch(`${this.apiBase}/progress/my-progress`, { headers:{ Authorization:`Bearer ${localStorage.getItem('authToken')}` } }); const d = await r.json(); this.displayProgressData(d); } catch { utils.showAlert('Failed to load progress data','danger'); }
  }
  displayProgressData(data){
    const s = data.stats;
    document.getElementById('enrolled-courses').textContent = s.courses_enrolled; 
    document.getElementById('completed-courses').textContent = s.courses_completed; 
    document.getElementById('tasks-completed').textContent = s.tasks_completed; 
    document.getElementById('certificates-earned').textContent = s.certificates_earned;
    const list = document.getElementById('my-courses-list');
    if(!data.courses.length) list.innerHTML = '<p class="text-muted">No courses enrolled yet. <a href="#" onclick="showPage(\'courses\')">Browse courses</a></p>';
    else list.innerHTML = data.courses.map(c=>`
      <div class='card mb-3'><div class='card-body'>
        <div class='d-flex justify-content-between align-items-start mb-2'><h6 class='card-title'>${c.title}</h6><span class='badge ${c.progress===100?'bg-success':'bg-primary'}'>${c.progress}%</span></div>
        <div class='progress mb-2' style='height:8px;'><div class='progress-bar' style='width:${c.progress}%'></div></div>
        <div class='d-flex justify-content-between align-items-center'><small class='text-muted'>Started: ${utils.formatDate(c.enrolled_at)}</small><button class='btn btn-sm btn-outline-primary' onclick='viewCourse(${c.id})'>${c.progress===100?'Review':'Continue'}</button></div>
      </div></div>`).join('');
  }
  async loadProfile(){
    try { 
      const r = await fetch(`${this.apiBase}/auth/profile`, { headers:{ Authorization:`Bearer ${localStorage.getItem('authToken')}` } }); 
      const u = await r.json(); 
      document.getElementById('profile-name').textContent = u.username; 
      document.getElementById('profile-email').textContent = u.email; 
      document.getElementById('profile-member-since').textContent = utils.formatDate(u.created_at); 
      document.getElementById('profile-avatar').textContent = utils.getUserInitials(u.username); 
      document.getElementById('profile-username').value = u.username; 
      document.getElementById('profile-email-input').value = u.email; 
    } catch { utils.showAlert('Failed to load profile','danger'); }
  }
  showCertificateModal(){
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">🎉 Course Completed!</h5></div><div class="modal-body text-center"><h4>Congratulations!</h4><p>You've completed <strong>${this.currentCourse.title}</strong></p><p>Generate your certificate to showcase your achievement!</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Later</button><button type="button" class="btn btn-primary" onclick="app.generateCertificate(${this.currentCourse.id})">Generate Certificate</button></div></div></div>`;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal); bsModal.show();
    modal.addEventListener('hidden.bs.modal', ()=> modal.remove());
  }
  async generateCertificate(courseId){
    try { const r = await fetch(`${this.apiBase}/courses/${courseId}/certificate`, { method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('authToken')}` } }); const d = await r.json(); if(r.ok){ utils.showAlert('Certificate generated!','success'); document.querySelector('.modal .btn-secondary')?.click(); } else utils.showAlert(d.error,'danger'); } catch { utils.showAlert('Failed to generate certificate','danger'); }
  }
}

const app = new LearningPlatform();