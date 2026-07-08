import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "./models/Role.js";
import { DEFAULT_ROLE_PERMISSIONS } from "./utils/permissionCatalog.js";

dotenv.config();

async function fixRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/asset-management");
    console.log("Connected to MongoDB.");

    const roles = await Role.find({ isSystem: true });
    
    for (const role of roles) {
      if (DEFAULT_ROLE_PERMISSIONS[role.key]) {
        await Role.updateOne(
          { _id: role._id },
          { $set: { permissions: DEFAULT_ROLE_PERMISSIONS[role.key] } }
        );
        console.log(`Updated permissions for ${role.key}`);
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
