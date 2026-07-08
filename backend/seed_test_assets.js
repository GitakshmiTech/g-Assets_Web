const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/assetManagement')
  .then(async () => {
    const today = new Date();
    
    // Asset 1: Warranty expiring in 3 days
    // Purchase Date = exactly 1 year minus 3 days ago. Warranty = 12 months.
    const pDate1 = new Date();
    pDate1.setFullYear(pDate1.getFullYear() - 1);
    pDate1.setDate(pDate1.getDate() + 3);
    
    // Asset 2: Maintenance due in 2 days
    // Purchase Date = exactly 6 months minus 2 days ago. Maintenance Period = 6 months.
    const pDate2 = new Date();
    pDate2.setMonth(pDate2.getMonth() - 6);
    pDate2.setDate(pDate2.getDate() + 2);

    const testAssets = [
      {
        assetName: 'Test MacBook Pro (Warranty Check)',
        category: 'Laptop',
        assetStatus: 'ASSIGNED',
        serialNumber: 'TEST-MAC-001',
        assetCode: 'MAC-WARR-001',
        purchaseDate: pDate1.toISOString().split('T')[0],
        warrantyPeriod: '12',
        warrantyReminderDays: '10',
        assignedTo: 'priyam dodiya',
        employeeId: 'emp001',
        employeeEmail: 'dpriyam746@gmail.com',
        price: '150000',
        vendor: 'Apple Store'
      },
      {
        assetName: 'Test Server (Maintenance Check)',
        category: 'Server',
        assetStatus: 'ASSIGNED',
        serialNumber: 'TEST-SRV-001',
        assetCode: 'SRV-MAIN-001',
        purchaseDate: pDate2.toISOString().split('T')[0],
        maintenancePeriod: '6',
        assignedTo: 'priyam dodiya',
        employeeId: 'emp01',
        employeeEmail: 'priyamdodiya24@gmail.com',
        price: '250000',
        vendor: 'Dell'
      }
    ];

    const result = await mongoose.connection.db.collection('assets').insertMany(testAssets);
    console.log('Test assets inserted:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

