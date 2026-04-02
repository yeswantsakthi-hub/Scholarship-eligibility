import { z } from 'zod';
import { insertUserSchema, insertScholarshipSchema, users, scholarships, applications } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      path: '/api/register' as const,
      method: 'POST' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      path: '/api/login' as const,
      method: 'POST' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      path: '/api/me' as const,
      method: 'GET' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      path: '/api/logout' as const,
      method: 'POST' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  scholarships: {
    list: {
      path: '/api/scholarships' as const,
      method: 'GET' as const,
      responses: {
        200: z.array(z.custom<typeof scholarships.$inferSelect>()),
      },
    },
    create: {
      path: '/api/scholarships' as const,
      method: 'POST' as const,
      input: insertScholarshipSchema,
      responses: {
        201: z.custom<typeof scholarships.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      path: '/api/scholarships/:id' as const,
      method: 'DELETE' as const,
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  applications: {
    list: {
      path: '/api/applications' as const,
      method: 'GET' as const,
      responses: {
        200: z.array(z.any()), // ApplicationWithDetails
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      path: '/api/applications' as const,
      method: 'POST' as const,
      input: z.any(), // FormData handles 'scholarshipId' and 'document'
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      path: '/api/applications/:id/status' as const,
      method: 'PATCH' as const,
      input: z.object({
        status: z.enum(['Pending', 'Approved', 'Rejected']),
        remarks: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
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
