import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { Product } from "./entities/product";
import { Category } from "./entities/category";
import { SubCategory } from "./entities/sub-category";
import { Option } from "./entities/option";
import { OptionValue } from "./entities/option-value";
import { ProductVariation } from "./entities/product-variation";
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Permission } from "./entities/permission";
import { Brand } from "./entities/brand";
import { SubSubCategory } from "./entities/sub-sub-category";
import { ProductImage } from "./entities/product-image";
import { File } from "./entities/file";
import { Cart } from "./entities/cart";
import { CartItem } from "./entities/cart-item";
import { Customer } from "./entities/customer";
import { Order } from "./entities/order";
import { OrderItem } from "./entities/order-item";
import {  Filter, FilterValue } from "./entities/filter";
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
    Option,
    OptionValue,
    ProductVariation,
    User,
    Role,
    Permission,
    Product,
    Brand,
    SubSubCategory,
    ProductImage,
    File,
    Cart,
    CartItem,
    Customer,
    Order,
    OrderItem ,
    Filter,
    FilterValue ,
  ],
  migrations: [],
});
export const getRepository = (model: EntityTarget<any>) =>
  AppDataSource.getRepository(model);
   