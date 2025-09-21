const utils = {
  showAlert(message, type='info') {
    const el = document.createElement('div');
    el.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    el.style.cssText = 'top:20px;right:20px;z-index:9999;max-width:400px';
    el.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),5000);
  },
  getUserInitials(name){ return name? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2):'U'; },
  formatDate(d){ return new Date(d).toLocaleDateString(); },
  showPage(id){ document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }
};