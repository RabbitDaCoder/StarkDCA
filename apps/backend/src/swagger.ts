// ─── Swagger / OpenAPI Setup ─────────────────────────────────────────

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'StarkDCA API',
      version: '1.0.0',
      description: 'BTC Dollar Cost Averaging protocol on Starknet — REST API documentation',
      contact: {
        name: 'StarkDCA Team',
        email: 'Starkdca@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input' },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: {} },
                pagination: {
                  type: 'object',
                  properties: {
                    nextCursor: { type: 'string', nullable: true },
                    hasMore: { type: 'boolean' },
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'System', description: 'Health and status endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'DCA Plans', description: 'DCA plan management' },
      { name: 'Price', description: 'Price feed endpoints' },
    ],
  },
  apis: ['./src/routes.ts', './src/modules/*/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'StarkDCA API Docs',
    }),
  );

  // Serve raw OpenAPI spec
  app.get('/api/docs/json', (_req, res) => {
    res.json(swaggerSpec);
  });
}
