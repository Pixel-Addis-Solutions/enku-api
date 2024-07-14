import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { Product } from "./entities/product";
import { Category } from "./entities/category";
import { SubCategory } from "./entities/sub-category";
import { ProductOption } from "./entities/option";
import { ProductOptionValue } from "./entities/option-value";
import { ProductVariation } from "./entities/product-variation";
import { ProductVariationOption } from "./entities/product-variation-option";
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Permission } from "./entities/permission";
import { Brand } from "./entities/brand";
require("dotenv").config();

console.log("process.env.DATABASE_HOST", process.env.DB_HOST);

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true, // Set to false in production
  logging: false,
  entities: [
    Product,
    Category,
    SubCategory,
    ProductOption,
    ProductOptionValue,
    ProductVariation,
    ProductVariationOption,
    User,
    Role,
    Permission,
    Product,
    Brand,
  ],
  migrations: [],
});
export const getRepository = (model: EntityTarget<any>) =>
  AppDataSource.getRepository(model);
