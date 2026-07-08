import mongoose from 'mongoose';
import Asset from './models/Asset.js';

mongoose.connect('mongodb://localhost:27017/assetManagement').then(async () => {
  const result = await Asset.deleteMany({ assetName: { $regex: /Demo/i } });
  console.log('Deleted Demo assets:', result.deletedCount);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
