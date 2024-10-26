import { Request, Response } from "express";
import { CustomerService } from "../../services/customer-service";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { getRepository } from "../../data-source";
import { Cart } from "../../entities/cart";
import { Customer } from "../../entities/customer";
import bcrypt from "bcryptjs";

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, name, email, password } = req.body;
    const customer = await CustomerService.register(
      phoneNumber,
      name,
      email,
      password
    );
    return ResUtil.success({
      res,
      message: "Customer registered successfully",
      data: customer,
    });
  } catch (error) {
    logger.error(`Error registering customer: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error registering customer",
      data: error,
    });
  }
};
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, fullName, email, password } = req.body;

    const userId = req.params.id;
    const customerRepository = getRepository(Customer);

    const customer = (await customerRepository.findOne({
      where: { id: userId },
    })) as Customer;

    if (!customer) {
      throw new Error("Profile Not found");
    }

    if (password) {
      customer.password = await bcrypt.hash(password, 10);
    }
    if (fullName) {
      customer.fullName = fullName;
    }
    if (phoneNumber) {
      customer.phoneNumber = phoneNumber;
    }
    if (email) {
      customer.email = email;
    }

    await customerRepository.save(customer);

    return ResUtil.success({
      res,
      message: "Profile Updated successfully",
      data: customer,
    });
  } catch (error) {
    logger.error(`Error registering customer: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error registering customer",
      data: error,
    });
  }
};

export const loginCustomer = async (req: any, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    console.log('reeee',phoneNumber);
    
    const { customer, token } = await CustomerService.login(
      phoneNumber,
      "123456"
    );
    const sessionId = req.headers["sessionid"];
    console.log("sessionIdddddd", sessionId);

    // Update cart items with the new customer ID
    const cartRepository = getRepository(Cart);
    let cart = await cartRepository.findOne({ where: { sessionId } });
    console.log("sessionId", sessionId);
    console.log("user cart by sessionId", cart);
    console.log("customer", customer);
    if (cart) {
      cart.customerId = customer.id;
      cart.sessionId = null;
      await cartRepository.save(cart);
    }
    return ResUtil.success({
      res,
      message: "Customer logged in successfully",
      data: { customer, token },
    });
  } catch (error: any) {
    logger.error(`Error logging in customer: ${error}`);
    return ResUtil.internalError({
      res,
      message: error?.message || "Error logging in customer",
      data: error,
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  const customerRepository = getRepository(Customer);
  const customer = await customerRepository.findOneBy({
    id: req.params.id as string,
  }); // Adjust based on how you fetch customer data

  if (!customer) {
    throw new Error("Customer not found");
  }
  return ResUtil.success({
    res,
    message: "Customer logged in successfully",
    data: customer,
  });
};
