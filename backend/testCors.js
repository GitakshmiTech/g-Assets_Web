import http from 'http';

const options = {
  hostname: 'localhost',
  port: 7000,
  path: '/api/roles/SUPER_ADMIN',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5175',
    'Access-Control-Request-Method': 'DELETE',
    'Access-Control-Request-Headers': 'authorization,x-client-origin,x-platform'
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data));
});

req.on('error', error => console.error(error));
req.end();
