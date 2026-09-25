import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding LaPrizza Database ---');

  // 1. Seed Users (BCK01)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@laprizza.com' },
    update: {},
    create: {
      email: 'manager@laprizza.com',
      password: passwordHash,
      name: 'Mario Rossi',
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@laprizza.com' },
    update: {},
    create: {
      email: 'staff@laprizza.com',
      password: passwordHash,
      name: 'Luigi Verde',
      role: 'STAFF',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@laprizza.com' },
    update: {},
    create: {
      email: 'customer@laprizza.com',
      password: passwordHash,
      name: 'Ana Silva',
      role: 'CUSTOMER',
    },
  });

  // Seed Customer Record (BCK02)
  await prisma.customer.upsert({
    where: { email: 'customer@laprizza.com' },
    update: {},
    create: {
      userId: customerUser.id,
      name: 'Ana Silva',
      email: 'customer@laprizza.com',
      phone: '+351 912 345 678',
      vatNumber: 'PT123456789',
      address: 'Rua do ISEP 42, Porto',
    },
  });

  // 2. Seed Product Categories (BCK03)
  const catPizza = await prisma.productCategory.upsert({
    where: { name: 'Pizzas' },
    update: {},
    create: { name: 'Pizzas', description: 'Traditional and gourmet pizzas' },
  });

  const catIngredients = await prisma.productCategory.upsert({
    where: { name: 'Pizza Ingredients' },
    update: {},
    create: { name: 'Pizza Ingredients', description: 'Components used in pizza assembly' },
  });

  const catDrinks = await prisma.productCategory.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: { name: 'Beverages', description: 'Soft drinks, beer and wine' },
  });

  // 3. Seed Allergens (BCK04)
  const allergenGluten = await prisma.allergen.upsert({
    where: { code: 'GLUTEN' },
    update: {},
    create: { code: 'GLUTEN', name: 'Gluten', description: 'Cereals containing gluten' },
  });

  const allergenDairy = await prisma.allergen.upsert({
    where: { code: 'DAIRY' },
    update: {},
    create: { code: 'DAIRY', name: 'Dairy', description: 'Milk and milk products' },
  });

  const allergenNuts = await prisma.allergen.upsert({
    where: { code: 'NUTS' },
    update: {},
    create: { code: 'NUTS', name: 'Nuts', description: 'Tree nuts and peanuts' },
  });

  // 4. Seed Pizza Sizes (BCK06)
  const sizeSmall = await prisma.pizzaSize.upsert({
    where: { name: 'Small' },
    update: {},
    create: { name: 'Small', diameterCm: 25, isActive: true },
  });

  const sizeMedium = await prisma.pizzaSize.upsert({
    where: { name: 'Medium' },
    update: {},
    create: { name: 'Medium', diameterCm: 30, isActive: true },
  });

  const sizeLarge = await prisma.pizzaSize.upsert({
    where: { name: 'Large' },
    update: {},
    create: { name: 'Large', diameterCm: 35, isActive: true },
  });

  // 5. Seed Pizza Component Types (BCK07) - Mandatory initial configurations from spec
  const typeDough = await prisma.pizzaComponentType.upsert({
    where: { name: 'Base Dough' },
    update: {},
    create: { name: 'Base Dough', assemblyOrder: 1, minQuantity: 1, maxQuantity: 1 },
  });

  const typeSauce = await prisma.pizzaComponentType.upsert({
    where: { name: 'Base Sauce' },
    update: {},
    create: { name: 'Base Sauce', assemblyOrder: 2, minQuantity: 0, maxQuantity: 1 },
  });

  const typeCheese = await prisma.pizzaComponentType.upsert({
    where: { name: 'Cheese' },
    update: {},
    create: { name: 'Cheese', assemblyOrder: 3, minQuantity: 0, maxQuantity: 1 },
  });

  const typeTopping = await prisma.pizzaComponentType.upsert({
    where: { name: 'Topping' },
    update: {},
    create: { name: 'Topping', assemblyOrder: 4, minQuantity: 0, maxQuantity: null },
  });

  // 6. Seed Ingredients (Products with isPizzaComponent = true) (BCK05)
  const dough = await prisma.product.upsert({
    where: { name: 'Traditional Dough' },
    update: {},
    create: {
      name: 'Traditional Dough',
      description: 'Slow-fermented traditional Neapolitan pizza dough',
      categoryId: catIngredients.id,
      isSellable: false,
      isStockControlled: true,
      isPizzaComponent: true,
      componentTypeId: typeDough.id,
      allergens: { connect: [{ id: allergenGluten.id }] },
    },
  });

  const sauce = await prisma.product.upsert({
    where: { name: 'San Marzano Tomato Sauce' },
    update: {},
    create: {
      name: 'San Marzano Tomato Sauce',
      description: 'Authentic San Marzano tomato sauce with fresh basil',
      categoryId: catIngredients.id,
      isSellable: false,
      isStockControlled: true,
      isPizzaComponent: true,
      componentTypeId: typeSauce.id,
    },
  });

  const mozzarella = await prisma.product.upsert({
    where: { name: 'Fresh Mozzarella' },
    update: {},
    create: {
      name: 'Fresh Mozzarella',
      description: 'Fior di latte fresh mozzarella',
      categoryId: catIngredients.id,
      isSellable: false,
      isStockControlled: true,
      isPizzaComponent: true,
      componentTypeId: typeCheese.id,
      allergens: { connect: [{ id: allergenDairy.id }] },
    },
  });

  const ham = await prisma.product.upsert({
    where: { name: 'Cooked Ham' },
    update: {},
    create: {
      name: 'Cooked Ham',
      description: 'Italian prosciutto cotto',
      categoryId: catIngredients.id,
      isSellable: false,
      isStockControlled: true,
      isPizzaComponent: true,
      componentTypeId: typeTopping.id,
    },
  });

  const mushrooms = await prisma.product.upsert({
    where: { name: 'Fresh Mushrooms' },
    update: {},
    create: {
      name: 'Fresh Mushrooms',
      description: 'Sliced button mushrooms',
      categoryId: catIngredients.id,
      isSellable: false,
      isStockControlled: true,
      isPizzaComponent: true,
      componentTypeId: typeTopping.id,
    },
  });

  // 7. Seed Component Size Configurations (BCK08) - Pricing & stock units per size
  // Dough
  for (const [size, price, stock] of [
    [sizeSmall, 1.50, 1],
    [sizeMedium, 2.00, 2],
    [sizeLarge, 2.50, 3],
  ] as const) {
    await prisma.componentSizeConfiguration.upsert({
      where: { productId_pizzaSizeId: { productId: dough.id, pizzaSizeId: size.id } },
      update: {},
      create: { productId: dough.id, pizzaSizeId: size.id, price, stockUnitsConsumed: stock },
    });
  }

  // Sauce
  for (const [size, price, stock] of [
    [sizeSmall, 0.80, 1],
    [sizeMedium, 1.00, 1],
    [sizeLarge, 1.20, 2],
  ] as const) {
    await prisma.componentSizeConfiguration.upsert({
      where: { productId_pizzaSizeId: { productId: sauce.id, pizzaSizeId: size.id } },
      update: {},
      create: { productId: sauce.id, pizzaSizeId: size.id, price, stockUnitsConsumed: stock },
    });
  }

  // Mozzarella (from Table 1 of specification)
  for (const [size, price, stock] of [
    [sizeSmall, 1.00, 1],
    [sizeMedium, 1.50, 2],
    [sizeLarge, 2.00, 3],
  ] as const) {
    await prisma.componentSizeConfiguration.upsert({
      where: { productId_pizzaSizeId: { productId: mozzarella.id, pizzaSizeId: size.id } },
      update: {},
      create: { productId: mozzarella.id, pizzaSizeId: size.id, price, stockUnitsConsumed: stock },
    });
  }

  // Ham (from Table 1 of specification)
  for (const [size, price, stock] of [
    [sizeSmall, 1.00, 1],
    [sizeMedium, 1.50, 1],
    [sizeLarge, 2.00, 2],
  ] as const) {
    await prisma.componentSizeConfiguration.upsert({
      where: { productId_pizzaSizeId: { productId: ham.id, pizzaSizeId: size.id } },
      update: {},
      create: { productId: ham.id, pizzaSizeId: size.id, price, stockUnitsConsumed: stock },
    });
  }

  // Mushrooms
  for (const [size, price, stock] of [
    [sizeSmall, 0.70, 1],
    [sizeMedium, 1.00, 1],
    [sizeLarge, 1.40, 2],
  ] as const) {
    await prisma.componentSizeConfiguration.upsert({
      where: { productId_pizzaSizeId: { productId: mushrooms.id, pizzaSizeId: size.id } },
      update: {},
      create: { productId: mushrooms.id, pizzaSizeId: size.id, price, stockUnitsConsumed: stock },
    });
  }

  // 8. Seed Stock Quantities (BCK09)
  for (const [prod, initialStock] of [
    [dough, 100],
    [sauce, 80],
    [mozzarella, 50],
    [ham, 40],
    [mushrooms, 30],
  ] as const) {
    await prisma.stockInformation.upsert({
      where: { productId: prod.id },
      update: {},
      create: { productId: prod.id, currentStockUnits: initialStock },
    });
  }

  // 9. Seed Sellable Non-Pizza Product (BCK05: Beverage)
  await prisma.product.upsert({
    where: { name: 'Italian Sparkling Mineral Water (500ml)' },
    update: {},
    create: {
      name: 'Italian Sparkling Mineral Water (500ml)',
      description: 'San Pellegrino sparkling water',
      categoryId: catDrinks.id,
      isSellable: true,
      isStockControlled: true,
      isPizzaComponent: false,
      basePrice: 2.50,
      stock: { create: { currentStockUnits: 60 } },
    },
  });

  // 10. Seed Predefined Pizza: Margherita (BCK10)
  const margheritaProduct = await prisma.product.upsert({
    where: { name: 'Pizza Margherita' },
    update: {},
    create: {
      name: 'Pizza Margherita',
      description: 'Classic pizza with tomato sauce, fresh mozzarella and basil',
      categoryId: catPizza.id,
      isSellable: true,
      isStockControlled: false,
      isPizzaComponent: false,
      basePrice: 8.50,
      allergens: { connect: [{ id: allergenGluten.id }, { id: allergenDairy.id }] },
    },
  });

  // Default configuration for Margherita
  const margheritaConfig = await prisma.pizzaConfiguration.create({
    data: {
      pizzaSizeId: sizeMedium.id,
      components: {
        create: [
          { productId: dough.id, quantity: 1 },
          { productId: sauce.id, quantity: 1 },
          { productId: mozzarella.id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.predefinedPizza.upsert({
    where: { productId: margheritaProduct.id },
    update: {},
    create: {
      productId: margheritaProduct.id,
      defaultConfigId: margheritaConfig.id,
    },
  });

  console.log('✅ Database seeded successfully with initial ISEP Sprint 1 data.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
