/**
 * Aqualink - Swagger/OpenAPI Configuration
 *
 * Defines the complete OpenAPI 3.0 specification for the AquaLink API.
 * Uses swagger-jsdoc conventions via JSDoc annotations.
 *
 * @module docs/swagger
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AquaLink API',
      version: '1.0.0',
      description:
        'AquaLink is a platform connecting fish farmers (fishers), buyers, and transporters. ' +
        'This API provides endpoints for managing users, fish listings, orders, payments, deliveries, ' +
        'notifications, reviews, and role-based dashboards.',
      contact: {
        name: 'AquaLink Support',
        email: 'support@aqualink.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API base path',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login response',
        },
      },
      schemas: {
        // ──────────────────────────────────────────────
        //  Reusable Schemas
        // ──────────────────────────────────────────────

        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User UUID' },
            name: { type: 'string', description: 'Full name' },
            phone: { type: 'string', description: 'Phone number' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            role: {
              type: 'string',
              enum: ['fisher', 'buyer', 'transporter', 'admin'],
              description: 'User role',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserInput: {
          type: 'object',
          required: ['name', 'phone', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', description: 'Full name', example: 'John Doe' },
            phone: { type: 'string', description: 'Phone number', example: '+919876543210' },
            email: { type: 'string', format: 'email', description: 'Email address', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, description: 'Password (min 6 chars)', example: 'secret123' },
            role: {
              type: 'string',
              enum: ['fisher', 'buyer', 'transporter'],
              description: 'User role',
              example: 'buyer',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'Email address', example: 'john@example.com' },
            password: { type: 'string', description: 'Password', example: 'secret123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful.' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', description: 'JWT access token' },
              },
            },
          },
        },

        Listing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fisherId: { type: 'string', format: 'uuid' },
            species: { type: 'string', description: 'Fish species name' },
            weight: { type: 'number', format: 'decimal', description: 'Weight in kg' },
            pricePerKg: { type: 'number', format: 'decimal', description: 'Price per kilogram' },
            freshnessTimestamp: { type: 'string', format: 'date-time', description: 'When the catch was made' },
            status: {
              type: 'string',
              enum: ['available', 'reserved', 'sold', 'expired'],
            },
            photoUrl: { type: 'string', format: 'uri', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ListingInput: {
          type: 'object',
          required: ['species', 'weight', 'pricePerKg', 'freshnessTimestamp'],
          properties: {
            species: { type: 'string', description: 'Fish species name', example: 'Rohu' },
            weight: { type: 'number', description: 'Weight in kg', example: 50.5 },
            pricePerKg: { type: 'number', description: 'Price per kilogram', example: 180.0 },
            freshnessTimestamp: { type: 'string', format: 'date-time', description: 'Catch timestamp', example: '2026-06-20T08:00:00Z' },
            photoUrl: { type: 'string', format: 'uri', nullable: true, description: 'Optional photo URL', example: 'https://example.com/fish.jpg' },
          },
        },
        ListingUpdateInput: {
          type: 'object',
          properties: {
            species: { type: 'string', description: 'Fish species name' },
            weight: { type: 'number', description: 'Weight in kg' },
            pricePerKg: { type: 'number', description: 'Price per kilogram' },
            freshnessTimestamp: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['available', 'reserved', 'sold', 'expired'] },
            photoUrl: { type: 'string', format: 'uri', nullable: true },
          },
        },

        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            buyerId: { type: 'string', format: 'uuid' },
            listingId: { type: 'string', format: 'uuid' },
            quantityKg: { type: 'number', format: 'decimal', description: 'Quantity ordered in kg' },
            totalPrice: { type: 'number', format: 'decimal', description: 'Total calculated price' },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'delivered'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderInput: {
          type: 'object',
          required: ['listingId', 'quantityKg'],
          properties: {
            listingId: { type: 'string', format: 'uuid', description: 'Listing UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
            quantityKg: { type: 'number', description: 'Quantity in kg', example: 10.0 },
          },
        },
        OrderStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'delivered'],
              description: 'New order status',
              example: 'accepted',
            },
          },
        },

        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            amount: { type: 'number', format: 'decimal' },
            paymentMethod: { type: 'string', enum: ['upi', 'card', 'cash'] },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
            settlementStatus: { type: 'string', enum: ['pending', 'settled', 'completed'] },
            transactionReference: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TransactionInput: {
          type: 'object',
          required: ['orderId', 'paymentMethod'],
          properties: {
            orderId: { type: 'string', format: 'uuid', description: 'Order UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
            paymentMethod: { type: 'string', enum: ['upi', 'card', 'cash'], description: 'Payment method', example: 'upi' },
          },
        },
        TransactionPayInput: {
          type: 'object',
          required: ['reference'],
          properties: {
            reference: { type: 'string', description: 'Payment reference number', example: 'TXN123456789' },
          },
        },

        Delivery: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            transporterId: { type: 'string', format: 'uuid' },
            pickupTime: { type: 'string', format: 'date-time', nullable: true },
            deliveryTime: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DeliveryInput: {
          type: 'object',
          required: ['orderId', 'transporterId'],
          properties: {
            orderId: { type: 'string', format: 'uuid', description: 'Order UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
            transporterId: { type: 'string', format: 'uuid', description: 'Transporter user UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          },
        },
        DeliveryStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
              description: 'New delivery status',
              example: 'in_transit',
            },
          },
        },

        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        NotificationInput: {
          type: 'object',
          required: ['userId', 'title', 'message', 'type'],
          properties: {
            userId: { type: 'string', format: 'uuid', description: 'Target user UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
            title: { type: 'string', description: 'Notification title', example: 'Order Update' },
            message: { type: 'string', description: 'Notification message', example: 'Your order has been shipped.' },
            type: { type: 'string', description: 'Notification type', example: 'order_update' },
          },
        },

        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            buyerId: { type: 'string', format: 'uuid' },
            fisherId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ReviewInput: {
          type: 'object',
          required: ['orderId', 'rating'],
          properties: {
            orderId: { type: 'string', format: 'uuid', description: 'Order UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
            rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)', example: 4 },
            comment: { type: 'string', description: 'Optional comment', example: 'Fresh fish, great quality!' },
          },
        },
        ReviewUpdateInput: {
          type: 'object',
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
            comment: { type: 'string', description: 'Optional comment' },
          },
        },
        FisherRating: {
          type: 'object',
          properties: {
            fisherId: { type: 'string', format: 'uuid' },
            averageRating: { type: 'number', format: 'float', description: 'Average rating' },
            totalReviews: { type: 'integer', description: 'Total number of reviews' },
          },
        },

        DashboardAdmin: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalListings: { type: 'integer' },
            totalOrders: { type: 'integer' },
            totalRevenue: { type: 'number', format: 'decimal' },
            pendingDeliveries: { type: 'integer' },
            pendingTransactions: { type: 'integer' },
            activeUsers: { type: 'integer' },
          },
        },
        DashboardFisher: {
          type: 'object',
          properties: {
            totalListings: { type: 'integer' },
            activeListings: { type: 'integer' },
            totalOrders: { type: 'integer' },
            totalRevenue: { type: 'number', format: 'decimal' },
            averageRating: { type: 'number', format: 'float' },
            recentOrders: {
              type: 'array',
              items: { $ref: '#/components/schemas/Order' },
            },
          },
        },
        DashboardBuyer: {
          type: 'object',
          properties: {
            totalOrders: { type: 'integer' },
            pendingOrders: { type: 'integer' },
            totalSpent: { type: 'number', format: 'decimal' },
            recentOrders: {
              type: 'array',
              items: { $ref: '#/components/schemas/Order' },
            },
          },
        },
        DashboardTransporter: {
          type: 'object',
          properties: {
            totalDeliveries: { type: 'integer' },
            pendingDeliveries: { type: 'integer' },
            completedDeliveries: { type: 'integer' },
            activeDeliveries: {
              type: 'array',
              items: { $ref: '#/components/schemas/Delivery' },
            },
          },
        },

        // ──────────────────────────────────────────────
        //  Standard Response Wrappers
        // ──────────────────────────────────────────────

        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful.' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Error description.' },
                type: { type: 'string', example: 'ValidationError' },
              },
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Field is required.' },
                type: { type: 'string', example: 'ValidationError' },
              },
            },
          },
        },
        NotFoundResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Resource not found.' },
                type: { type: 'string', example: 'NotFoundError' },
              },
            },
          },
        },
        UnauthorizedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Authentication required.' },
                type: { type: 'string', example: 'UnauthorizedError' },
              },
            },
          },
        },
        ForbiddenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Insufficient permissions.' },
                type: { type: 'string', example: 'ForbiddenError' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Authentication', description: 'User registration, login, and profile' },
      { name: 'Users', description: 'Current user information' },
      { name: 'Listings', description: 'Fish listing CRUD operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Transactions', description: 'Payment transactions' },
      { name: 'Deliveries', description: 'Delivery management' },
      { name: 'Notifications', description: 'In-app notifications' },
      { name: 'Reviews', description: 'Order reviews and ratings' },
      { name: 'Dashboard', description: 'Role-based analytics dashboards' },
    ],
    paths: {
      // ──────────────────────────────────────────────
      //  Health
      // ──────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Returns API health status.',
          operationId: 'healthCheck',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'API is running.' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                  example: {
                    success: true,
                    message: 'API is running.',
                    timestamp: '2026-06-21T10:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Authentication
      // ──────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Creates a new user account with the specified role (fisher, buyer, or transporter). Returns user data and a JWT token.',
          operationId: 'authRegister',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserInput' },
                example: {
                  name: 'John Doe',
                  phone: '+919876543210',
                  email: 'john@example.com',
                  password: 'secret123',
                  role: 'buyer',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'User registered successfully.' },
                          data: {
                            type: 'object',
                            properties: {
                              user: { $ref: '#/components/schemas/User' },
                              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                            },
                          },
                        },
                      },
                    ],
                  },
                  example: {
                    success: true,
                    message: 'User registered successfully.',
                    data: {
                      user: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        name: 'John Doe',
                        phone: '+919876543210',
                        email: 'john@example.com',
                        role: 'buyer',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                      token: 'eyJhbGciOiJIUzI1NiIs...',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Name, phone, email, and password are required.',
                      type: 'ValidationError',
                    },
                  },
                },
              },
            },
            409: {
              description: 'Conflict - email or phone already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'This email address is already registered.',
                      type: 'ValidationError',
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login',
          description: 'Authenticates a user with email and password. Returns user data and a JWT token.',
          operationId: 'authLogin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
                example: {
                  email: 'john@example.com',
                  password: 'secret123',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                  example: {
                    success: true,
                    message: 'Login successful.',
                    data: {
                      user: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        name: 'John Doe',
                        phone: '+919876543210',
                        email: 'john@example.com',
                        role: 'buyer',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                      token: 'eyJhbGciOiJIUzI1NiIs...',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Email and password are required.',
                      type: 'ValidationError',
                    },
                  },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UnauthorizedResponse' },
                  example: {
                    success: false,
                    error: {
                      message: 'Invalid email or password.',
                      type: 'UnauthorizedError',
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication', 'Users'],
          summary: 'Get current user profile',
          description: 'Returns the profile of the currently authenticated user. Requires a valid JWT token.',
          operationId: 'authGetMe',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      user: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        name: 'John Doe',
                        phone: '+919876543210',
                        email: 'john@example.com',
                        role: 'buyer',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UnauthorizedResponse' },
                },
              },
            },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Listings
      // ──────────────────────────────────────────────
      '/listings': {
        post: {
          tags: ['Listings'],
          summary: 'Create a listing',
          description: 'Creates a new fish listing. Requires authentication with fisher or admin role.',
          operationId: 'createListing',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingInput' },
                example: {
                  species: 'Rohu',
                  weight: 50.5,
                  pricePerKg: 180.0,
                  freshnessTimestamp: '2026-06-20T08:00:00Z',
                  photoUrl: 'https://example.com/fish.jpg',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Listing created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Fish listing created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          listing: { $ref: '#/components/schemas/Listing' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Fish listing created successfully.',
                    data: {
                      listing: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        fisherId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        species: 'Rohu',
                        weight: 50.5,
                        pricePerKg: 180.0,
                        freshnessTimestamp: '2026-06-20T08:00:00.000Z',
                        status: 'available',
                        photoUrl: 'https://example.com/fish.jpg',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires fisher or admin role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Listings'],
          summary: 'Get all listings',
          description: 'Retrieves all fish listings with optional filters, pagination, and sorting. Public endpoint.',
          operationId: 'getListings',
          parameters: [
            { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['available', 'reserved', 'sold', 'expired'] }, description: 'Filter by listing status' },
            { name: 'species', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by fish species' },
            { name: 'fisherId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by fisher UUID' },
            { name: 'minPrice', in: 'query', required: false, schema: { type: 'number' }, description: 'Minimum price per kg' },
            { name: 'maxPrice', in: 'query', required: false, schema: { type: 'number' }, description: 'Maximum price per kg' },
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number (default: 1)' },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, description: 'Items per page (default: 10, max: 100)' },
            { name: 'sortBy', in: 'query', required: false, schema: { type: 'string', default: 'createdAt' }, description: 'Sort field (default: createdAt)' },
            { name: 'order', in: 'query', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort direction (default: desc)' },
          ],
          responses: {
            200: {
              description: 'List of listings',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 2 },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer', example: 2 },
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 10 },
                          totalPages: { type: 'integer', example: 1 },
                          hasNext: { type: 'boolean', example: false },
                          hasPrevious: { type: 'boolean', example: false },
                        },
                      },
                      data: {
                        type: 'object',
                        properties: {
                          listings: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Listing' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 2,
                    pagination: {
                      total: 2,
                      page: 1,
                      limit: 10,
                      totalPages: 1,
                      hasNext: false,
                      hasPrevious: false,
                    },
                    data: {
                      listings: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          fisherId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          species: 'Rohu',
                          weight: 50.5,
                          pricePerKg: 180.0,
                          freshnessTimestamp: '2026-06-20T08:00:00.000Z',
                          status: 'available',
                          photoUrl: null,
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/listings/{id}': {
        get: {
          tags: ['Listings'],
          summary: 'Get a listing by ID',
          description: 'Retrieves a single fish listing by its UUID. Public endpoint.',
          operationId: 'getListingById',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Listing UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Listing details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          listing: { $ref: '#/components/schemas/Listing' },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Listing not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } },
            },
          },
        },
        put: {
          tags: ['Listings'],
          summary: 'Update a listing',
          description: 'Updates a fish listing. Only the owning fisher or an admin can update.',
          operationId: 'updateListing',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Listing UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListingUpdateInput' },
                example: {
                  pricePerKg: 190.0,
                  status: 'reserved',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Listing updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Listing updated successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          listing: { $ref: '#/components/schemas/Listing' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Listing not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
        delete: {
          tags: ['Listings'],
          summary: 'Delete a listing',
          description: 'Deletes a fish listing. Only the owning fisher or an admin can delete.',
          operationId: 'deleteListing',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Listing UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Listing deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Listing deleted successfully.' },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Listing deleted successfully.',
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Listing not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Orders
      // ──────────────────────────────────────────────
      '/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Create an order',
          description: 'Creates a new purchase order. Requires authentication with buyer role.',
          operationId: 'createOrder',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrderInput' },
                example: {
                  listingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  quantityKg: 10.0,
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Order created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          order: { $ref: '#/components/schemas/Order' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Order created successfully.',
                    data: {
                      order: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        buyerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        listingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        quantityKg: 10.0,
                        totalPrice: 1800.0,
                        status: 'pending',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires buyer role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Orders'],
          summary: 'Get all orders',
          description: 'Retrieves all orders scoped to the authenticated user. Buyers see their own orders; fishers see orders for their listings; admins see all.',
          operationId: 'getOrders',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'delivered'] }, description: 'Filter by order status' },
            { name: 'buyerId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by buyer UUID' },
            { name: 'listingId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by listing UUID' },
          ],
          responses: {
            200: {
              description: 'List of orders',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'object',
                        properties: {
                          orders: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Order' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 1,
                    data: {
                      orders: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          buyerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          listingId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          quantityKg: 10.0,
                          totalPrice: 1800.0,
                          status: 'pending',
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },
      '/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get an order by ID',
          description: 'Retrieves a single order by UUID. Access is controlled based on user role and ownership.',
          operationId: 'getOrderById',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Order UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Order details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          order: { $ref: '#/components/schemas/Order' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Update order status',
          description: 'Updates the status of an order. Only the listing owner (fisher) or an admin can update.',
          operationId: 'updateOrderStatus',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Order UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrderStatusInput' },
                example: { status: 'accepted' },
              },
            },
          },
          responses: {
            200: {
              description: 'Order status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order status updated to "accepted" successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          order: { $ref: '#/components/schemas/Order' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Order status updated to "accepted" successfully.',
                    data: {
                      order: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        status: 'accepted',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires fisher or admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Transactions
      // ──────────────────────────────────────────────
      '/transactions': {
        post: {
          tags: ['Transactions'],
          summary: 'Create a transaction',
          description: 'Creates a new payment transaction for an order. Requires authentication with buyer role.',
          operationId: 'createTransaction',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInput' },
                example: {
                  orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  paymentMethod: 'upi',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Transaction created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          transaction: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Transaction created successfully.',
                    data: {
                      transaction: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        amount: 1800.0,
                        paymentMethod: 'upi',
                        paymentStatus: 'pending',
                        settlementStatus: 'pending',
                        transactionReference: null,
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires buyer role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Transactions'],
          summary: 'Get all transactions',
          description: 'Retrieves all transactions scoped to the authenticated user. Buyers see their own; admins see all.',
          operationId: 'getTransactions',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of transactions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'object',
                        properties: {
                          transactions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Transaction' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 1,
                    data: {
                      transactions: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          amount: 1800.0,
                          paymentMethod: 'upi',
                          paymentStatus: 'pending',
                          settlementStatus: 'pending',
                          transactionReference: null,
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },
      '/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get a transaction by ID',
          description: 'Retrieves a single transaction by UUID. Access controlled by ownership or admin role.',
          operationId: 'getTransactionById',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Transaction details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          transaction: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/transactions/{id}/pay': {
        patch: {
          tags: ['Transactions'],
          summary: 'Mark transaction as paid',
          description: 'Marks a transaction as paid with a payment reference. Buyer or admin can perform this action.',
          operationId: 'markTransactionAsPaid',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionPayInput' },
                example: { reference: 'TXN123456789' },
              },
            },
          },
          responses: {
            200: {
              description: 'Transaction marked as paid',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction marked as paid successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          transaction: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/transactions/{id}/fail': {
        patch: {
          tags: ['Transactions'],
          summary: 'Mark transaction as failed',
          description: 'Marks a transaction as failed. Buyer or admin can perform this action.',
          operationId: 'markTransactionAsFailed',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Transaction marked as failed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction marked as failed successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          transaction: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/transactions/{id}/refund': {
        patch: {
          tags: ['Transactions'],
          summary: 'Refund a transaction',
          description: 'Marks a transaction as refunded. Only admin can perform this action.',
          operationId: 'markTransactionAsRefunded',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Transaction refunded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction refunded successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          transaction: { $ref: '#/components/schemas/Transaction' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
            404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Deliveries
      // ──────────────────────────────────────────────
      '/deliveries': {
        post: {
          tags: ['Deliveries'],
          summary: 'Create a delivery',
          description: 'Creates a new delivery record for an order. Requires authentication with fisher or admin role.',
          operationId: 'createDelivery',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeliveryInput' },
                example: {
                  orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  transporterId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Delivery created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Delivery created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          delivery: { $ref: '#/components/schemas/Delivery' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Delivery created successfully.',
                    data: {
                      delivery: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        transporterId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        pickupTime: null,
                        deliveryTime: null,
                        status: 'assigned',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires fisher or admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Deliveries'],
          summary: 'Get all deliveries',
          description: 'Retrieves all deliveries scoped to the authenticated user. Transporters see their assigned deliveries; admins see all.',
          operationId: 'getDeliveries',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of deliveries',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'object',
                        properties: {
                          deliveries: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Delivery' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 1,
                    data: {
                      deliveries: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          transporterId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          pickupTime: null,
                          deliveryTime: null,
                          status: 'assigned',
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },
      '/deliveries/{id}': {
        get: {
          tags: ['Deliveries'],
          summary: 'Get a delivery by ID',
          description: 'Retrieves a single delivery by UUID. Access controlled by ownership or admin role.',
          operationId: 'getDeliveryById',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Delivery UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Delivery details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          delivery: { $ref: '#/components/schemas/Delivery' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Delivery not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/deliveries/{id}/status': {
        patch: {
          tags: ['Deliveries'],
          summary: 'Update delivery status',
          description: 'Updates the status of a delivery. Transporter or admin can perform this action.',
          operationId: 'updateDeliveryStatus',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Delivery UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeliveryStatusInput' },
                example: { status: 'in_transit' },
              },
            },
          },
          responses: {
            200: {
              description: 'Delivery status updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Delivery status updated successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          delivery: { $ref: '#/components/schemas/Delivery' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Delivery status updated successfully.',
                    data: {
                      delivery: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        status: 'in_transit',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires transporter or admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
            404: { description: 'Delivery not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Notifications
      // ──────────────────────────────────────────────
      '/notifications': {
        post: {
          tags: ['Notifications'],
          summary: 'Create a notification',
          description: 'Creates a new notification for a user. Requires authentication with admin role.',
          operationId: 'createNotification',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationInput' },
                example: {
                  userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  title: 'Order Update',
                  message: 'Your order has been shipped.',
                  type: 'order_update',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Notification created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Notification created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          notification: { $ref: '#/components/schemas/Notification' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Notification created successfully.',
                    data: {
                      notification: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        title: 'Order Update',
                        message: 'Your order has been shipped.',
                        type: 'order_update',
                        isRead: false,
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires admin role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Notifications'],
          summary: 'Get all notifications',
          description: 'Retrieves all notifications for the authenticated user. Includes an unread count.',
          operationId: 'getNotifications',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of notifications',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 2 },
                      unreadCount: { type: 'integer', example: 1 },
                      data: {
                        type: 'object',
                        properties: {
                          notifications: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Notification' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 2,
                    unreadCount: 1,
                    data: {
                      notifications: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          title: 'Order Update',
                          message: 'Your order has been shipped.',
                          type: 'order_update',
                          isRead: false,
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },
      '/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
          description: 'Returns the count of unread notifications for the authenticated user.',
          operationId: 'getUnreadNotificationCount',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Unread count',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          unreadCount: { type: 'integer', example: 5 },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      unreadCount: 5,
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },
      '/notifications/{id}': {
        get: {
          tags: ['Notifications'],
          summary: 'Get a notification by ID',
          description: 'Retrieves a single notification by UUID.',
          operationId: 'getNotificationById',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Notification details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          notification: { $ref: '#/components/schemas/Notification' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Delete a notification',
          description: 'Deletes a notification. Only the notification owner or admin can delete.',
          operationId: 'deleteNotification',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Notification deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Notification deleted successfully.' },
                      data: { type: 'null' },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Notification deleted successfully.',
                    data: null,
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          description: 'Marks a single notification as read.',
          operationId: 'markNotificationAsRead',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Notification marked as read',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Notification marked as read.' },
                      data: {
                        type: 'object',
                        properties: {
                          notification: { $ref: '#/components/schemas/Notification' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Notification marked as read.',
                    data: {
                      notification: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        isRead: true,
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          description: 'Marks all notifications for the authenticated user as read.',
          operationId: 'markAllNotificationsAsRead',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'All notifications marked as read',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Successfully marked 3 notification(s) as read.' },
                      data: {
                        type: 'object',
                        properties: {
                          updatedCount: { type: 'integer', example: 3 },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Successfully marked 3 notification(s) as read.',
                    data: {
                      updatedCount: 3,
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Reviews
      // ──────────────────────────────────────────────
      '/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Create a review',
          description: 'Creates a new review for an order. Requires authentication with buyer role.',
          operationId: 'createReview',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewInput' },
                example: {
                  orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  rating: 4,
                  comment: 'Fresh fish, great quality!',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Review created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Review created successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          review: { $ref: '#/components/schemas/Review' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    message: 'Review created successfully.',
                    data: {
                      review: {
                        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        buyerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        fisherId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        rating: 4,
                        comment: 'Fresh fish, great quality!',
                        createdAt: '2026-06-21T10:00:00.000Z',
                        updatedAt: '2026-06-21T10:00:00.000Z',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires buyer role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
        get: {
          tags: ['Reviews'],
          summary: 'Get all reviews',
          description: 'Retrieves all reviews with optional filters. Public endpoint.',
          operationId: 'getReviews',
          parameters: [
            { name: 'fisherId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by fisher UUID' },
            { name: 'buyerId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by buyer UUID' },
            { name: 'rating', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Filter by rating' },
            { name: 'orderId', in: 'query', required: false, schema: { type: 'string', format: 'uuid' }, description: 'Filter by order UUID' },
          ],
          responses: {
            200: {
              description: 'List of reviews',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'object',
                        properties: {
                          reviews: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Review' },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    count: 1,
                    data: {
                      reviews: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          buyerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          fisherId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          rating: 4,
                          comment: 'Fresh fish, great quality!',
                          createdAt: '2026-06-21T10:00:00.000Z',
                          updatedAt: '2026-06-21T10:00:00.000Z',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/reviews/{id}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get a review by ID',
          description: 'Retrieves a single review by UUID. Public endpoint.',
          operationId: 'getReviewById',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Review UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Review details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          review: { $ref: '#/components/schemas/Review' },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
        patch: {
          tags: ['Reviews'],
          summary: 'Update a review',
          description: 'Updates a review. Only the review owner (buyer) or admin can update.',
          operationId: 'updateReview',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Review UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewUpdateInput' },
                example: {
                  rating: 5,
                  comment: 'Excellent quality!',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Review updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Review updated successfully.' },
                      data: {
                        type: 'object',
                        properties: {
                          review: { $ref: '#/components/schemas/Review' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
        delete: {
          tags: ['Reviews'],
          summary: 'Delete a review',
          description: 'Deletes a review. Only the review owner (buyer) or admin can delete.',
          operationId: 'deleteReview',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Review UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Review deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Review deleted successfully.' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },
      '/reviews/fisher/{fisherId}/rating': {
        get: {
          tags: ['Reviews'],
          summary: 'Get fisher average rating',
          description: 'Returns the average rating and total review count for a specific fisher. Public endpoint.',
          operationId: 'getFisherRating',
          parameters: [
            { name: 'fisherId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Fisher UUID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          ],
          responses: {
            200: {
              description: 'Fisher rating',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          rating: { $ref: '#/components/schemas/FisherRating' },
                        },
                      },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      rating: {
                        fisherId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        averageRating: 4.5,
                        totalReviews: 12,
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Fisher not found or no reviews', content: { 'application/json': { schema: { $ref: '#/components/schemas/NotFoundResponse' } } } },
          },
        },
      },

      // ──────────────────────────────────────────────
      //  Dashboard
      // ──────────────────────────────────────────────
      '/dashboard/admin': {
        get: {
          tags: ['Dashboard'],
          summary: 'Admin dashboard',
          description: 'Returns global platform statistics. Requires authentication with admin role.',
          operationId: 'getAdminDashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Admin dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/DashboardAdmin' },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      totalUsers: 150,
                      totalListings: 320,
                      totalOrders: 580,
                      totalRevenue: 125000.0,
                      pendingDeliveries: 25,
                      pendingTransactions: 12,
                      activeUsers: 85,
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires admin role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
      },
      '/dashboard/fisher': {
        get: {
          tags: ['Dashboard'],
          summary: 'Fisher dashboard',
          description: 'Returns fisher-specific listing, order, revenue, and rating statistics. Requires authentication with fisher role.',
          operationId: 'getFisherDashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Fisher dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/DashboardFisher' },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      totalListings: 25,
                      activeListings: 18,
                      totalOrders: 45,
                      totalRevenue: 32000.0,
                      averageRating: 4.3,
                      recentOrders: [],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires fisher role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
      },
      '/dashboard/buyer': {
        get: {
          tags: ['Dashboard'],
          summary: 'Buyer dashboard',
          description: 'Returns buyer-specific order, payment, and spending statistics. Requires authentication with buyer role.',
          operationId: 'getBuyerDashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Buyer dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/DashboardBuyer' },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      totalOrders: 18,
                      pendingOrders: 3,
                      totalSpent: 15000.0,
                      recentOrders: [],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires buyer role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
      },
      '/dashboard/transporter': {
        get: {
          tags: ['Dashboard'],
          summary: 'Transporter dashboard',
          description: 'Returns transporter-specific delivery statistics. Requires authentication with transporter role.',
          operationId: 'getTransporterDashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Transporter dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/DashboardTransporter' },
                    },
                  },
                  example: {
                    success: true,
                    data: {
                      totalDeliveries: 30,
                      pendingDeliveries: 5,
                      completedDeliveries: 22,
                      activeDeliveries: [],
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/UnauthorizedResponse' } } } },
            403: { description: 'Forbidden - requires transporter role', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;