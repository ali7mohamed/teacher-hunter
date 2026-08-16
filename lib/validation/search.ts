import { z } from "zod";

export const searchFiltersSchema = z.object({
  subject: z.string().trim().max(120).optional(),
  educationLevel: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  minSubscribers: z.coerce.number().int().min(0).max(100_000_000).optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().trim().min(1, "Enter a search query.").max(300),
  filters: searchFiltersSchema.optional(),
});

export type SearchRequestInput = z.infer<typeof searchRequestSchema>;

export const leadsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["new", "contacted", "replied", "negotiating", "client", "rejected"]).optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  search: z.string().trim().max(200).optional(),
});

export const leadIdSchema = z.string().uuid();

export const leadPatchSchema = z.object({
  status: z.enum(["new", "contacted", "replied", "negotiating", "client", "rejected"]).optional(),
  notes: z.string().max(5000).optional(),
});
