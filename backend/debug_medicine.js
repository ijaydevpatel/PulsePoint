import fetch from 'node-fetch';

async function debugMedicine() {
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

  console.log('Testing Medicine with Mistral Turbo...');
  const start = Date.now();
  const res = await fetch('http://localhost:5000/api/medicine/check', {
    method: 'POST',
    headers,
    body: JSON.stringify({ primaryMedicine: 'Aspirin', secondaryMedicine: 'Ibuprofen' })
  });
  
  const data = await res.json();
  const end = Date.now();
  console.log('STATUS:', res.status);
  console.log('TIME:', (end - start) / 1000, 's');
  console.log('DATA:', JSON.stringify(data, null, 2));
}

debugMedicine();
