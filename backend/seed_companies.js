import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/assetManagement')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Create 3 dummy companies
    const companies = [
      {
        companyName: "Acme Corp",
        companyCode: "GT-0001",
        email: "admin@acmecorp.com",
        phone: "1234567890",
        gstNumber: "22AAAAA0000A1Z5",
        industry: "Technology",
        website: "https://acmecorp.com",
        address: "123 Tech Lane",
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        logo: "",
        status: "Active",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        companyName: "Global Solutions",
        companyCode: "GT-0002",
        email: "contact@globalsolutions.com",
        phone: "0987654321",
        gstNumber: "22BBBBB0000B1Z5",
        industry: "Consulting",
        website: "https://globalsolutions.com",
        address: "456 Business Blvd",
        country: "India",
        state: "Delhi",
        city: "New Delhi",
        logo: "",
        status: "Active",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        companyName: "Innovatech",
        companyCode: "GT-0003",
        email: "hello@innovatech.io",
        phone: "1122334455",
        gstNumber: "22CCCCC0000C1Z5",
        industry: "Software",
        website: "https://innovatech.io",
        address: "789 Startup Road",
        country: "India",
        state: "Karnataka",
        city: "Bangalore",
        logo: "",
        status: "Active",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('companies').insertMany(companies);
    console.log("3 companies seeded successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
