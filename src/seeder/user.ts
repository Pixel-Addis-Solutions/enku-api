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

      { name: "create-Blog" },
      { name: "view-Blog" },
      { name: "update-Blog" },
      { name: "delete-Blog" },

      { name: "create-Brand" },
      { name: "view-Brand" },
      { name: "update-Brand" },
      { name: "delete-Brand" },

      { name: "create-HomePageCard" },
      { name: "view-HomePageCard" },
      { name: "update-HomePageCard" },
      { name: "delete-HomePageCard" },

      { name: "create-Carousel" },
      { name: "view-Carousel" },
      { name: "update-Carousel" },
      { name: "delete-Carousel" },

      { name: "view-Cart" },
      { name: "delete-Cart" },

      { name: "create-Category" },
      { name: "view-Category" },
      { name: "update-Category" },
      { name: "delete-Category" },

      { name: "view-Customer" },

      { name: "view-Dashboard" },

      { name: "create-Discount" },
      { name: "view-Discount" },
      { name: "update-Discount" },
      { name: "delete-Discount" },

      { name: "create-FilterValue'" },
      { name: "delete-FilterValue" },

      { name: "create-Fliter" },
      { name: "view-Fliter" },
      { name: "delete-Fliter" },

      { name: "create-LoyalityProgram" },
      { name: "view-LoyalityProgram" },
      { name: "update-LoyalityProgram" },
      { name: "delete-LoyalityProgram" },

      { name: "create-order" },
      { name: "view-order" },
      { name: "update-order" },

      { name: "create-product" },
      { name: "view-product" },
      { name: "update-product" },
      { name: "delete-product" },

      { name: "create-SubCategory" },
      { name: "view-SubCategory" },
      { name: "update-SubCategory" },
      { name: "delete-SubCategory" },

      { name: "create-SubSubCategory" },
      { name: "view-SubSubCategory" },
      { name: "update-SubSubCategory" },
      { name: "delete-SubSubCategory" },

      { name: "create-Testimony" },
      { name: "view-Testimony" },
      { name: "update-Testimony" },
      { name: "delete-Testimony" },
      
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