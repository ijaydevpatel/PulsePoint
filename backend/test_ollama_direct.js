import http from 'http';

const data = JSON.stringify({
  model: 'mistral:latest',
  prompt: 'Say hi',
  stream: false
});

const options = {
  hostname: 'localhost',
  port: 11434,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', responseBody);
  });
});

req.on('error', (e) => {
  console.error('PROBLEM:', e.message);
});

req.write(data);
req.end();
