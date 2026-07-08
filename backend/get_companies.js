import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/assetManagement')
  .then(async () => {
    const db = mongoose.connection.db;
    const allCompanies = await db.collection('companies').find().toArray();
    console.log(`Total companies: ${allCompanies.length}`);
    const activeCompanies = await db.collection('companies').find({ $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }, { isDeleted: { $ne: true } }] }).toArray();
    console.log(`Active companies: ${activeCompanies.length}`);
    console.log(JSON.stringify(allCompanies, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
