import { getRepository } from "../data-source";
import { Customer } from "../entities/customer";
import { hash, compare } from "bcryptjs";
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
      password = await hash(password, 10);
    }

    customer = customerRepository.create({
      phoneNumber,
      name,
      email,
      password,
    });
    await customerRepository.save(customer);

    return customer;
  }

  static async login(phoneNumber: string, password?: string) {
    const customerRepository = getRepository(Customer);

    const customer = await customerRepository.findOne({
      where: { phoneNumber },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (password && customer.password) {
      const isMatch = await compare(password, customer.password);
      if (!isMatch) {
        throw new Error("Incorrect password");
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer.id, phoneNumber: customer.phoneNumber },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { customer, token };
  }
}
