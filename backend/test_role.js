import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../backend/.env" });

import Role, { ensureDefaultRoles } from "../backend/models/Role.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/asset_management");
  
  console.log("Connected to DB.");

  let employeeRole = await Role.findOne({ key: "EMPLOYEE" });
  console.log("Before Update:", employeeRole?.permissions);

  if (employeeRole) {
    employeeRole.permissions = ["dashboard.view", "asset.view"];
    await employeeRole.save();
    console.log("Saved.");
  }

  let updatedRole = await Role.findOne({ key: "EMPLOYEE" });
  console.log("After Update:", updatedRole?.permissions);

  await ensureDefaultRoles();

  let finalRole = await Role.findOne({ key: "EMPLOYEE" });
  console.log("After ensureDefaultRoles:", finalRole?.permissions);

  process.exit(0);
}

run().catch(console.error);
