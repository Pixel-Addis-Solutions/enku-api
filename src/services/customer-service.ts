import { getRepository } from "../data-source";
import { Customer } from "../entities/customer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class CustomerService {
  static async register(
    phoneNumber: string,
    name?: string,
    email?: string,
    password?: string
  ) {
    const customerRepository = getRepository(Customer);

    let customer = await customerRepository.findOne({ where: { phoneNumber } });

    if (customer) {
      throw new Error("Customer already exists with this phone number");
    }

    if (password) {
      password = await bcrypt.hash(password, 10);
    }

    customer = customerRepository.create({
      phoneNumber,
      name,
      email,
      password,
    });
    await customerRepository.save(customer);
     delete customer.password;
    return customer;
  }

  static async login(phoneNumber: string, password: string) {
    const customerRepository = getRepository(Customer);
    let customer = await customerRepository.findOne({ where: { phoneNumber } });

    // If customer does not exist, create a new one
    if (!customer) {
      const hashedPassword = await bcrypt.hash(password, 10);
      customer = customerRepository.create({
        phoneNumber,
        password: hashedPassword,
      });
      await customerRepository.save(customer);
    } else {
      // If customer exists, verify the password
      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
    }

    const token = jwt.sign({ id: customer.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    return { customer, token };
  }
}
