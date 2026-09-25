import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';
import authRoutes from './presentation/routes/authRoutes';
import customerRoutes from './presentation/routes/customerRoutes';
import categoryRoutes from './presentation/routes/categoryRoutes';
import allergenRoutes from './presentation/routes/allergenRoutes';
import pizzaSizeRoutes from './presentation/routes/pizzaSizeRoutes';
import pizzaComponentTypeRoutes from './presentation/routes/pizzaComponentTypeRoutes';
import productRoutes from './presentation/routes/productRoutes';
import componentSizeConfigRoutes from './presentation/routes/componentSizeConfigRoutes';
import stockRoutes from './presentation/routes/stockRoutes';
import predefinedPizzaRoutes from './presentation/routes/predefinedPizzaRoutes';
import catalogueRoutes from './presentation/routes/catalogueRoutes';
import { errorHandler } from './presentation/middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  // Core Middlewares
  app.use(cors());
  app.use(express.json());

  // Swagger Documentation (ARC03)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'LaPrizza Back-End REST API',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/allergens', allergenRoutes);
  app.use('/api/pizza-sizes', pizzaSizeRoutes);
  app.use('/api/pizza-component-types', pizzaComponentTypeRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/component-size-configs', componentSizeConfigRoutes);
  app.use('/api/stock', stockRoutes);
  app.use('/api/predefined-pizzas', predefinedPizzaRoutes);
  app.use('/api/catalogue', catalogueRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
