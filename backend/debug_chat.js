import fetch from 'node-fetch';

async function debugChat() {
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

  console.log('Testing Chat Stream with Mistral Turbo...');
  const res = await fetch('http://localhost:5000/api/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: 'What is a cold?' })
  });
  
  if (!res.ok) {
     console.error('STREAM FAILED:', res.status);
     console.log(await res.text());
     return;
  }

  res.body.on('data', chunk => {
    console.log('CHUNK:', chunk.toString());
  });
  
  res.body.on('end', () => console.log('STREAM ENDED'));
}

debugChat();
