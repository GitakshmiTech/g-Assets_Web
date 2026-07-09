import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "./models/Role.js";
import { DEFAULT_ROLE_PERMISSIONS, DEFAULT_ROLE_SIDEBAR } from "./utils/permissionCatalog.js";

dotenv.config();

async function fixRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/asset-management");
    console.log("Connected to MongoDB.");

    const roles = await Role.find({});
    
    for (const role of roles) {
      const updateData = {};
      if (DEFAULT_ROLE_PERMISSIONS[role.key]) {
        updateData.permissions = DEFAULT_ROLE_PERMISSIONS[role.key];
      }
      if (DEFAULT_ROLE_SIDEBAR[role.key]) {
        updateData.sidebarAccess = DEFAULT_ROLE_SIDEBAR[role.key];
        updateData.access = DEFAULT_ROLE_SIDEBAR[role.key].join(", ");
      }
      if (Object.keys(updateData).length > 0) {
        await Role.updateOne({ _id: role._id }, { $set: updateData });
        console.log(`Updated permissions and sidebarAccess for ${role.key}`);
      }
    }
    
    console.log("Role permissions fix complete.");
  } catch (error) {
    console.error("Error fixing roles:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixRoles();
