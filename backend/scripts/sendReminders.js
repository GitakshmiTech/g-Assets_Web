const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Mongoose schema logic to quickly grab assets
const getAssets = async () => {
  return await mongoose.connection.db.collection('assets').find({}).toArray();
};

const sendReminders = async () => {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/assetManagement');
  console.log("Connected.");

  let transporter;
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("Using real Gmail SMTP...");
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    console.log("Setting up test email account (Ethereal)...");
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const assets = await getAssets();
  const today = new Date();
  let emailCount = 0;

  for (const asset of assets) {
    const assetName = asset.assetName || asset.assetCode || "Unknown Asset";
    
    // Check if it's assigned to someone with an email
    const employeeEmail = asset.employeeEmail || asset.assignedToEmail || null;
    if (!employeeEmail) continue; // No employee to email

    // Warranty Check
    let warrantyEnd = asset.warrantyEnd;
    if (!warrantyEnd && asset.purchaseDate && asset.warrantyPeriod) {
      const d = new Date(asset.purchaseDate);
      const m = Number(asset.warrantyPeriod);
      if (!isNaN(m) && m > 0) {
        d.setMonth(d.getMonth() + m);
        warrantyEnd = d;
      }
    }

    if (warrantyEnd) {
      const daysLeft = Math.ceil((new Date(warrantyEnd) - today) / 86400000);
      const reminderDays = Number(asset.warrantyReminderDays || 10);
      
      if (daysLeft >= 0 && daysLeft <= reminderDays) {
        console.log(`Sending Warranty Email for ${assetName} to ${employeeEmail}`);
        
        let info = await transporter.sendMail({
          from: '"Asset Management System" <no-reply@assetsystem.local>',
          to: employeeEmail,
          subject: `Reminder: Warranty expiring soon for ${assetName}`,
          text: `Hello ${asset.assignedTo || 'Employee'},\n\nThe warranty for your assigned asset "${assetName}" is expiring in ${daysLeft} day(s).\n\nPlease review it.\n\nThanks,\nAsset Management Team`,
        });

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        emailCount++;
      }
    }

    // Maintenance Check
    if (asset.purchaseDate && asset.maintenancePeriod) {
      const dueDate = new Date(asset.purchaseDate);
      const period = Number(asset.maintenancePeriod);
      
      if (!isNaN(period) && period > 0) {
        dueDate.setMonth(dueDate.getMonth() + period);
        while (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + period);
        }
        
        const daysLeft = Math.ceil((dueDate - today) / 86400000);
        if (daysLeft >= 0 && daysLeft <= 7) {
          console.log(`Sending Maintenance Email for ${assetName} to ${employeeEmail}`);
          
          let info = await transporter.sendMail({
            from: '"Asset Management System" <no-reply@assetsystem.local>',
            to: employeeEmail,
            subject: `Reminder: Maintenance due soon for ${assetName}`,
            text: `Hello ${asset.assignedTo || 'Employee'},\n\nThe maintenance for your assigned asset "${assetName}" is due in ${daysLeft} day(s).\n\nPlease review it.\n\nThanks,\nAsset Management Team`,
          });

          if (!process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          }
          emailCount++;
        }
      }
    }
  }

  console.log(`\nFinished sending ${emailCount} email(s).`);
  await mongoose.disconnect();
  process.exit(0);
};

sendReminders().catch(err => {
  console.error("Error running reminders:", err);
  process.exit(1);
});
