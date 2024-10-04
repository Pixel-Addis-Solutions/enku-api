import { Request, Response } from "express";
import { getRepository } from "../../data-source"; // Assuming you have a data-source setup
import { Testimonial } from "../../entities/testimonial";

// Create a new testimonial
export const createTestimonial = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, description, type, content } = req.body;

  const testimonial = new Testimonial();
  testimonial.name = name;
  testimonial.description = description;
  testimonial.type = type;
  testimonial.content = content;

  await getRepository(Testimonial).save(testimonial);
  return res.status(201).json({ message: "Testimonial created", testimonial });
};

// Get all testimonials
export const getAllTestimonials = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const testimonials = await getRepository(Testimonial).find();
  return res.status(200).json({ testimonials });
};

// Get a single testimonial by ID
export const getTestimonialById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const testimonial = await getRepository(Testimonial).findOneBy({
    id: Number(id),
  });

  if (!testimonial) {
    return res.status(404).json({ message: "Testimonial not found" });
  }

  return res.status(200).json({ testimonial });
};

// Update a testimonial by ID
export const updateTestimonial = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { name, description, type, content } = req.body;

  const testimonialRepository = getRepository(Testimonial);
  const testimonial = await testimonialRepository.findOneBy({ id: Number(id) });

  if (!testimonial) {
    return res.status(404).json({ message: "Testimonial not found" });
  }

  // Update fields
  testimonial.name = name ?? testimonial.name;
  testimonial.description = description ?? testimonial.description;
  testimonial.type = type ?? testimonial.type;
  testimonial.content = content ?? testimonial.content;


  await testimonialRepository.save(testimonial);
  return res.status(200).json({ message: "Testimonial updated", testimonial });
};

// Delete a testimonial by ID
export const deleteTestimonial = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const testimonialRepository = getRepository(Testimonial);
  const testimonial = await testimonialRepository.findOneBy({ id: Number(id) });

  if (!testimonial) {
    return res.status(404).json({ message: "Testimonial not found" });
  }

  await testimonialRepository.remove(testimonial);
  return res.status(200).json({ message: "Testimonial deleted" });
};
