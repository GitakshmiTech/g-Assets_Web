import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("Database connected successfully!");
    
    const oldEmail = "priyamdodiya123@gmail.com";
    const newEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
    const newPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdminSecure2026!";
    const newUsername = newEmail.split("@")[0] || "superadmin";

    let user = await User.findOne({ email: oldEmail });
    if (user) {
      console.log(`Found old super admin: ${user.email}. Updating to ${newEmail}...`);
      user.email = newEmail;
      user.username = newUsername;
      user.setPassword(newPassword);
      await user.save();
      console.log("Super admin updated successfully in database!");
    } else {
      console.log(`Old super admin with email ${oldEmail} not found in database.`);
      let newUser = await User.findOne({ email: newEmail });
      if (newUser) {
        console.log(`Super admin with new email ${newEmail} already exists. Updating password...`);
        newUser.setPassword(newPassword);
        await newUser.save();
        console.log("Password updated successfully!");
      } else {
        console.log("Creating new super admin...");
        newUser = new User({
          name: "Super Admin",
          username: newUsername,
          email: newEmail,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        });
        newUser.setPassword(newPassword);
        await newUser.save();
        console.log("New super admin created successfully!");
      }
    }

    const users = await User.find({});
    console.log("\nCURRENT USERS IN DB:");
    users.forEach((u) => {
      console.log(`- ID: ${u._id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Username: ${u.username}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
