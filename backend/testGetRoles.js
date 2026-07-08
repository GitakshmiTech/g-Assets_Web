import http from 'http';

const options = {
  hostname: 'localhost',
  port: 7000,
  path: '/api/roles',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data.substring(0, 100)}...`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
