import http from 'http';

const options = {
  hostname: 'localhost',
  port: 7000,
  path: '/api/roles/SUPER_ADMIN',
  method: 'DELETE',
  headers: {
    // We don't have a valid token here, but we can see if it returns 401 or crashes
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data}`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
