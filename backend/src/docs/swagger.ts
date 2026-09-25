export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'LaPrizza REST API',
    version: '1.0.0',
    description: 'REST API documentation for LaPrizza Restaurant Information System (LEI-ISEP Sem5: LAPR5 & ARQSI)',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local Development Server' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user and obtain JWT token (BCK01)',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'manager@laprizza.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with token' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/catalogue': {
      get: {
        summary: 'Consult products catalogue with pizza sizes and allergens (BCK11)',
        tags: ['Catalogue'],
        parameters: [
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of sellable products' },
        },
      },
    },
    '/api/categories': {
      get: {
        summary: 'Get all product categories (BCK03)',
        tags: ['Product Categories'],
        responses: { 200: { description: 'List of product categories' } },
      },
      post: {
        summary: 'Create a new product category (BCK03)',
        tags: ['Product Categories'],
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/api/allergens': {
      get: {
        summary: 'Get all allergens (BCK04)',
        tags: ['Allergens'],
        responses: { 200: { description: 'List of allergens' } },
      },
    },
    '/api/pizza-sizes': {
      get: {
        summary: 'Get all pizza sizes (BCK06)',
        tags: ['Pizza Sizes'],
        responses: { 200: { description: 'List of pizza sizes' } },
      },
    },
    '/api/pizza-component-types': {
      get: {
        summary: 'Get pizza component types and assembly orders (BCK07)',
        tags: ['Pizza Component Types'],
        responses: { 200: { description: 'List of component types' } },
      },
    },
    '/api/products': {
      get: {
        summary: 'List and filter products (BCK05)',
        tags: ['Products'],
        responses: { 200: { description: 'Filtered list of products' } },
      },
      post: {
        summary: 'Create a new product (BCK05)',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Product created' } },
      },
    },
    '/api/stock': {
      get: {
        summary: 'List stock levels for stock-controlled items (BCK09)',
        tags: ['Stock'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Stock list' } },
      },
    },
    '/api/stock/{productId}/increase': {
      post: {
        summary: 'Increase stock units for product (BCK09)',
        tags: ['Stock'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Stock updated' } },
      },
    },
    '/api/stock/{productId}/decrease': {
      post: {
        summary: 'Decrease stock units for product (BCK09)',
        tags: ['Stock'],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Stock updated' }, 422: { description: 'Insufficient stock' } },
      },
    },
    '/api/predefined-pizzas': {
      get: {
        summary: 'Get predefined pizzas with configurations (BCK10)',
        tags: ['Predefined Pizzas'],
        responses: { 200: { description: 'List of predefined pizzas' } },
      },
    },
  },
};
