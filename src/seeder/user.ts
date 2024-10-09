import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user";
import { Role } from "../entities/role";
import { Permission } from "../entities/permission";
import bcrypt from "bcrypt";
const seed = async () => {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);
 
    // Create permissions
    const permissions = [
      { name: "create-Category" }, 
      { name: "view-Category" },
      { name: "update-Category" },
      { name: "delete-Category" },
      { name: "create-User" },
      { name: "view-User" },
      { name: "update-User" },
      { name: "delete-User" },
    ];

    const savedPermissions = await permissionRepository.save(permissions);

    // Create role and assign permissions
    const adminRole = new Role();
    adminRole.name = "admin";
    adminRole.permissions = savedPermissions;

    const savedAdminRole = await roleRepository.save(adminRole);

    // Create user and assign role
    const adminUser = new User();
    adminUser.email = "admin@admin.com";
    adminUser.password = await bcrypt.hash("123456", 10);
    adminUser.role = savedAdminRole;

    await userRepository.save(adminUser);

    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

seed();
