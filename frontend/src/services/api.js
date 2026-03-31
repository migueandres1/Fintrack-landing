import axios from 'axios';

// En desarrollo: el proxy de Vite redirige /api → localhost:4000
// En producción: VITE_API_URL apunta al backend del landing (ej: https://api.fintrack.com)
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Inicia el proceso de pago en Stripe para un plan dado.
 * Devuelve la URL de la sesión de Stripe Checkout.
 * @param {'pro_monthly'|'pro_annual'|'familia_monthly'|'familia_annual'} priceKey
 * @returns {Promise<string>} URL de Stripe Checkout
 */
export async function startCheckout(priceKey) {
  const { data } = await http.post('/api/checkout', { price_key: priceKey });
  return data.url;
}
