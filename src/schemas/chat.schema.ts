
// src/schemas/chat.schema.ts

import { z } from 'zod';

/**
 * Defines the strict schema for a valid AI chat response.
 * This is the single source of truth for our application.
 * - reply: Must be a non-empty string.
 * - suggestions: An optional array of strings. Defaults to an empty array if missing.
 * - error: An optional string for technical error codes.
 */
/**
 * Structured intent metadata produced by the Concierge prompt.
 * Powers the frontend RecipeIntentCard and the "Tease & Lock" generation funnel.
 */
export const IntentMetaSchema = z.object({
  is_recipe_intent: z.boolean().optional().default(false),
  hero_recipe_title: z.string().nullable().optional(),
  prep_time: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export type IntentMeta = z.infer<typeof IntentMetaSchema>;

export const AiChatResponseSchema = z.object({
  reply: z.string().min(1, { message: "Reply cannot be empty." }),
  suggestions: z.array(z.string()).optional().default([]),
  error: z.string().optional(),
  // Concierge intent metadata. Optional so older/fallback responses remain valid.
  intent_meta: IntentMetaSchema.optional(),
  // The user's intent normalized to a canonical English dish/ingredient term, after
  // correcting misspellings/slang and translating regional or non-English food words.
  // Null when there is no concrete dish to normalize (e.g. pure greetings). Used for
  // "Did you mean…?" hints and to hand a clean query to the recipe generator.
  interpreted_as: z.string().nullable().optional(),
});

/**
 * Inferred TypeScript type from our Zod schema.
 * We will use this type throughout our application for full type-safety.
 */
export type AiChatResponse = z.infer<typeof AiChatResponseSchema>;