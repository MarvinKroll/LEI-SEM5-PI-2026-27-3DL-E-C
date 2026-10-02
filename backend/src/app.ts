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

  // Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // CORS Configuration (configurable via CORS_ORIGIN env variable, default http://localhost:5173)
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin.includes(',')
        ? allowedOrigin.split(',').map((o) => o.trim())
        : allowedOrigin,
      credentials: true,
    })
  );

  app.use(express.json());

  // Swagger Documentation (ARC03)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health check endpoints (versioned /api/v1/health per specification + backward compatibility)
  const getHealthData = () => ({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });

  app.get('/api/v1/health', (req, res) => {
    res.json(getHealthData());
  });

  app.get('/api/health', (req, res) => {
    res.json({
      ...getHealthData(),
      service: 'LaPrizza Back-End REST API',
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
