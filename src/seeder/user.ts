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

    // Save permissions only if they don't exist in the database
    const savedPermissions = [];
    for (const permission of permissions) {
      const existingPermission = await permissionRepository.findOne({ where: { name: permission.name } });
      if (!existingPermission) {
        const newPermission = permissionRepository.create(permission);
        savedPermissions.push(await permissionRepository.save(newPermission));
      } else {
        savedPermissions.push(existingPermission);
      }
    }

    // Check if the admin role already exists
    let adminRole = await roleRepository.findOne({where: { name: "admin"} });
    if (!adminRole) {
      adminRole = new Role();
      adminRole.name = "admin";
      adminRole.permissions = savedPermissions;
      adminRole = await roleRepository.save(adminRole);
    }

    // Check if the admin user already exists
    let adminUser = await userRepository.findOne({ where: { email: "admin@admin.com" }} );
    if (!adminUser) {
      adminUser = new User();
      adminUser.email = "admin@admin.com";
      adminUser.fullName = "admin admin";
      adminUser.password = await bcrypt.hash("123456", 10);
      adminUser.role = adminRole;
      adminUser = await userRepository.save(adminUser);
    }

    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

seed();