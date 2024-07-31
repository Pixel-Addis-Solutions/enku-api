import { AppDataSource, getRepository } from "../data-source";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/sub-category";
import { SubSubCategory } from "../entities/sub-sub-category";
import { Product } from "../entities/product";

const categories = [
  { name: "Makeup" },
  { name: "Eyes" },
  { name: "Lips" },
  { name: "Nails" },
  { name: "Tools & Brushes" },
];

const subCategories = [
  { name: "Face", categoryName: "Makeup" },
  { name: "Eyes", categoryName: "Makeup" },
  { name: "Lips", categoryName: "Makeup" },
  { name: "Nails", categoryName: "Makeup" },
  { name: "Tools & Brushes", categoryName: "Makeup" },
];

const subSubCategories = [
  { name: "Face Primer", subCategoryName: "Face" },
  { name: "Concealer", subCategoryName: "Face" },
  { name: "Foundation", subCategoryName: "Face" },
  { name: "Compact", subCategoryName: "Face" },
  { name: "Contour", subCategoryName: "Face" },
  { name: "Loose Powder", subCategoryName: "Face" },
  { name: "Tinted Moisturizer", subCategoryName: "Face" },
  { name: "Blush", subCategoryName: "Face" },
  { name: "Bronzer", subCategoryName: "Face" },
  { name: "BB & CC Cream", subCategoryName: "Face" },
  { name: "Highlighters", subCategoryName: "Face" },
  { name: "Setting Spray", subCategoryName: "Face" },
  { name: "Makeup Remover", subCategoryName: "Face" },
  { name: "Sindoor", subCategoryName: "Face" },
  { name: "Kajal", subCategoryName: "Eyes" },
  { name: "Eyeliner", subCategoryName: "Eyes" },
  { name: "Mascara", subCategoryName: "Eyes" },
  { name: "Eye Shadow", subCategoryName: "Eyes" },
  { name: "Eye Brow Enhancers", subCategoryName: "Eyes" },
  { name: "Eye Primer", subCategoryName: "Eyes" },
  { name: "False Eyelashes", subCategoryName: "Eyes" },
  { name: "Eye Makeup Remover", subCategoryName: "Eyes" },
  { name: "Under Eye Concealer", subCategoryName: "Eyes" },
  { name: "Contact Lenses", subCategoryName: "Eyes" },
  { name: "Lipstick", subCategoryName: "Lips" },
  { name: "Liquid Lipstick", subCategoryName: "Lips" },
  { name: "Lip Crayon", subCategoryName: "Lips" },
  { name: "Lip Gloss", subCategoryName: "Lips" },
  { name: "Lip Liner", subCategoryName: "Lips" },
  { name: "Lip Plumper", subCategoryName: "Lips" },
  { name: "Lip Tint", subCategoryName: "Lips" },
  { name: "Nail Polish", subCategoryName: "Nails" },
  { name: "Nail Art Kits", subCategoryName: "Nails" },
  { name: "Nail Care", subCategoryName: "Nails" },
  { name: "Makeup Kits & Combos", subCategoryName: "Nails" },
  { name: "Makeup Kits", subCategoryName: "Nails" },
  { name: "Makeup Combos", subCategoryName: "Nails" },
  { name: "Nail Polish Remover", subCategoryName: "Nails" },
  { name: "Face Brush", subCategoryName: "Tools & Brushes" },
  { name: "Eye Brush", subCategoryName: "Tools & Brushes" },
  { name: "Lip Brush", subCategoryName: "Tools & Brushes" },
  { name: "Brush Sets", subCategoryName: "Tools & Brushes" },
  { name: "Brush Cleaners", subCategoryName: "Tools & Brushes" },
  { name: "Sponges & Applicators", subCategoryName: "Tools & Brushes" },
  { name: "Eyelash Curlers", subCategoryName: "Tools & Brushes" },
  { name: "Tweezers", subCategoryName: "Tools & Brushes" },
  { name: "Sharpeners", subCategoryName: "Tools & Brushes" },
  { name: "Mirrors", subCategoryName: "Tools & Brushes" },
  { name: "Makeup Pouches", subCategoryName: "Tools & Brushes" },
  {
    name: "Multi-Functional Makeup Palettes",
    subCategoryName: "Tools & Brushes",
  },
];

const products = [
  {
    name: "Example Foundation",
    description: "A great foundation for all skin types.",
    ingredients: "Water, Glycerin, Titanium Dioxide",
    how_to_use: "Apply evenly to face.",
    price: 29.99,
    imageUrl: "37cae88a-cc92-4656-a152-4260a1ac9802",
    productionDate: "2023-01-01",
    expiryDate: "2024-01-01",
    origin: "USA",
    certified: true,
    metaTitle: "Best Foundation",
    metaDescription: "This is a great foundation.",
    metaKeywords: "foundation, makeup, beauty",
    subSubCategoryName: "Foundation",
    images: [
      "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_3.jpg",
      "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_5.jpg",
      "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_2.jpg",
    ],
    variations: [
      {
        sku: "Kay Beauty Illuminating Strobe Priming Drops - Rosey Twirl(30ml)",
        quantity: 100,
        images: [
          "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_3.jpg",
          "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_5.jpg",
          "https://images-static.nykaa.com/media/catalog/product/a/4/a4bed56KAYBE00000196_2.jpg",
        ],
        optionValues: [
          {
            option: "color",
            value: "Red",
          },
          {
            option: "size",
            value: "Small",
          },
        ],
      },
      {
        sku: "Kay Beauty Illuminating Strobe Priming Drops - Champagne Shimmy(30ml)",
        quantity: 150,
        images: [
          "https://images-static.nykaa.com/media/catalog/product/3/0/3096990LAKME00000766_1.jpg",
          "https://images-static.nykaa.com/media/catalog/product/3/0/3096990LAKME00000766_1.jpg",
        ],
        optionValues: [
          {
            option: "color",
            value: "White",
          },
          {
            option: "size",
            value: "Medium",
          },
        ],
      },
    ],
  },
  // Add more products here
];

const seedDatabase = async () => {
  await AppDataSource.initialize();

  const categoryRepository = getRepository(Category);
  const subCategoryRepository = getRepository(SubCategory);
  const subSubCategoryRepository = getRepository(SubSubCategory);
  const productRepository = getRepository(Product);

  // Seed categories
  for (const categoryData of categories) {
    const category = categoryRepository.create(categoryData);
    await categoryRepository.save(category);
  }

  // Seed subcategories
  for (const subCategoryData of subCategories) {
    const category = await categoryRepository.findOne({
      where: { name: subCategoryData.categoryName },
    });
    if (category) {
      const subCategory = subCategoryRepository.create({
        name: subCategoryData.name,
        category,
      });
      await subCategoryRepository.save(subCategory);
    }
  }

  // Seed sub-subcategories
  for (const subSubCategoryData of subSubCategories) {
    const subCategory = await subCategoryRepository.findOne({
      where: { name: subSubCategoryData.subCategoryName },
      relations: ["category"],
    });
    if (subCategory) {
      const subSubCategory = subSubCategoryRepository.create({
        name: subSubCategoryData.name,
        subCategory,
        category: subCategory.category,
      });
      await subSubCategoryRepository.save(subSubCategory);
    }
  }

  // Seed products
  //   for (const productData of products) {
  //     const subSubCategory = await subSubCategoryRepository.findOne({
  //       where: { name: productData.subSubCategoryName },
  //       relations: ["subCategory.category"],
  //     });
  //     if (subSubCategory) {
  //       const product = productRepository.create({
  //         ...productData,
  //         subSubCategory,
  //       });
  //       await productRepository.save(product);
  //     }
  //   }

  console.log("Database seeding completed.");
};

seedDatabase().catch(console.error);
