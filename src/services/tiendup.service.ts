/**
 * tiendup.service.ts — Servicio de integración con Tiendup
 *
 * Provee: crear checkout, verificar suscripción.
 * Usa Edge Functions de Supabase (nunca la API key en el frontend).
 */

import { supabase } from "@/integrations/supabase/client";

interface CheckoutResult {
  checkout_url: string;
  sale_id: string;
}

/**
 * Crear link de pago para un plan.
 * Llama a la Edge Function tiendup-checkout.
 */
export async function createCheckout(productId: string): Promise<CheckoutResult> {
  const { data, error } = await supabase.functions.invoke("tiendup-checkout", {
    body: { product_id: productId },
  });

  if (error) {
    throw new Error(error.message || "Error al crear checkout");
  }

  if (!data?.checkout_url) {
    throw new Error("No se recibió URL de checkout");
  }

  return data as CheckoutResult;
}

/**
 * Abrir checkout de Tiendup en nueva pestaña.
 */
export async function openCheckout(productId: string): Promise<void> {
  const result = await createCheckout(productId);
  window.open(result.checkout_url, "_blank");
}
