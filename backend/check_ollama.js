import fetch from 'node-fetch';

async function check() {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    const tags = await res.json();
    console.log('TAGS:', tags.models.map(m => m.name));
    
    const ps = await fetch('http://localhost:11434/api/ps');
    const psData = await ps.json();
    console.log('LOADED:', psData.models.map(m => m.name));
  } catch (e) {
    console.error('OLLAMA DOWN:', e.message);
  }
}
check();
