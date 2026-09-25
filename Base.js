require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const packageInfo = require('./package.json');

const app = express();
const apiPrefix = '/api/v1';
const port = Number(process.env.PORT || 8080);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const appVersion = process.env.APP_VERSION || packageInfo.version;

const openApiDocument = {
	openapi: '3.0.3',
	info: {
		title: 'API',
		version: appVersion,
	},
	servers: [{ url: apiPrefix }],
	paths: {
		'/health': {
			get: {
				responses: {
					200: {
						description: 'Service health status',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['status', 'version', 'timestamp'],
									properties: {
										status: { type: 'string', example: 'ok' },
										version: { type: 'string', example: '1.0.0' },
										timestamp: { type: 'string', format: 'date-time' },
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(morgan('combined'));

app.get(`${apiPrefix}/health`, (request, response) => {
	response.json({
		status: 'ok',
		version: appVersion,
		timestamp: new Date().toISOString(),
	});
});

app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use((request, response) => {
	response.status(404).json({
		error: {
			message: 'Route not found',
			status: 404,
			path: request.originalUrl,
			timestamp: new Date().toISOString(),
		},
	});
});

app.use((error, request, response, next) => {
	const statusCode = error.statusCode || error.status || 500;

	response.status(statusCode).json({
		error: {
			message: statusCode === 500 ? 'Internal server error' : error.message,
			status: statusCode,
			path: request.originalUrl,
			timestamp: new Date().toISOString(),
		},
	});
});

if (require.main === module) {
	app.listen(port, () => {
		console.log(`API listening on port ${port}`);
	});
}

module.exports = app;
