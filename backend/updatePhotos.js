import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/assetManagement').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String, companyId: mongoose.Schema.Types.ObjectId, profilePhoto: String }));
  const Company = mongoose.model('Company', new mongoose.Schema({ logo: String }));
  
  const users = await User.find({ profilePhoto: { $in: [null, ''] }, companyId: { $ne: null } });
  for (const user of users) {
    const company = await Company.findById(user.companyId);
    if (company && company.logo) {
      user.profilePhoto = company.logo;
      await user.save();
      console.log('Updated profile photo for user:', user.email);
    }
  }
  console.log('Done');
  process.exit(0);
}).catch(console.error);
