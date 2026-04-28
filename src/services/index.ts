/**
 * Services Layer — Centraliza toda la lógica de negocio
 *
 * Los componentes importan de aquí, nunca directamente de Supabase.
 * Si se migra el backend, solo se reescriben estos servicios.
 *
 * Uso:
 *   import { wallService, contentService, diagnosticService } from "@/services";
 *   const posts = await wallService.fetchWallPosts(0);
 */

// Re-export all services
export * as wallService from "./wall.service";
export * as contentService from "./content.service";
export * as diagnosticService from "./diagnostic.service";
