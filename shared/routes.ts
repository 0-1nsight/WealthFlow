import { z } from 'zod';
import { 
  insertExpenseSchema, 
  insertCategorySchema, 
  insertAssetSchema, 
  insertUserProfileSchema,
  expenses,
  categories,
  assets,
  userProfiles,
  netWorthEntries,
  insertNetWorthEntrySchema,
  receipts
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      input: z.object({
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // Complex return type with joins
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema.extend({
        splits: z.array(z.object({
          userId: z.string(),
          amountOwed: z.string(), // numeric passes as string in JSON usually, or verify if Zod handles it
          percentage: z.string()
        })).optional()
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/expenses/:id',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  assets: {
    list: {
      method: 'GET' as const,
      path: '/api/assets',
      responses: {
        200: z.array(z.custom<typeof assets.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/assets',
      input: insertAssetSchema,
      responses: {
        201: z.custom<typeof assets.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/assets/:id',
      input: insertAssetSchema.partial(),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
      },
    }
  },
  netWorth: {
    history: {
      method: 'GET' as const,
      path: '/api/net-worth',
      responses: {
        200: z.array(z.custom<typeof netWorthEntries.$inferSelect>()),
      },
    },
    log: {
      method: 'POST' as const,
      path: '/api/net-worth',
      input: z.object({}), // Usually triggered automatically or manually
      responses: {
        201: z.custom<typeof netWorthEntries.$inferSelect>(),
      }
    }
  },
  receipts: {
    process: {
      method: 'POST' as const,
      path: '/api/receipts/process',
      input: z.object({
        imageUrl: z.string(),
      }),
      responses: {
        200: z.object({
          total: z.number().optional(),
          date: z.string().optional(),
          items: z.array(z.any()).optional()
        })
      }
    }
  },
  userProfile: {
    get: {
      method: 'GET' as const,
      path: '/api/user-profile',
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/user-profile',
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
