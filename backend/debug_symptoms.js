import fetch from 'node-fetch';

async function debug() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'qa@pulsepoint.test', password: 'password123' })
  });
  const { token } = await loginRes.json();
  const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  };

  // Ensure profile exists
  await fetch('http://localhost:5000/api/profile', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fullName: 'QA Bot',
      age: 30,
      gender: 'Male',
      weight: 75,
      height: 180,
      bloodGroup: 'O+',
      allergies: ['None'],
      conditions: ['None']
    })
  });
  
  console.log('Testing Symptoms with Mistral Turbo...');
  const start = Date.now();
  const res = await fetch('http://localhost:5000/api/symptoms/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      activeSymptoms: ['headache'],
      customSymptom: 'test'
    })
  });
  
  const data = await res.json();
  const end = Date.now();
  console.log('STATUS:', res.status);
  console.log('TIME:', (end - start) / 1000, 's');
  console.log('DATA:', JSON.stringify(data, null, 2));
}

debug();
