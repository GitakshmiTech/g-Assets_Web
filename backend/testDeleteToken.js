import http from 'http';
import mongoose from 'mongoose';
import User from './models/User.js';
import { generateToken } from './utils/authToken.js';

mongoose.connect('mongodb://localhost:27017/assetManagement').then(async () => {
  const user = await User.findOne({ role: 'COMPANY_ADMIN' });
  const token = generateToken(user._id);

  const options = {
    hostname: 'localhost',
    port: 7000,
    path: '/api/roles/SUPER_ADMIN',
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Body:', data);
      process.exit();
    });
  });

  req.on('error', error => {
    console.error(error);
    process.exit(1);
  });

  req.end();
});
