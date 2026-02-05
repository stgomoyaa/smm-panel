/**
 * Obtiene la tasa de cambio USD a CLP desde la API gratuita
 * https://github.com/fawazahmed0/exchange-api
 */

export async function getUsdToClpRate(): Promise<number> {
  try {
    // Intentar con el CDN principal
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      { next: { revalidate: 3600 } } // Cache por 1 hora
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from CDN')
    }

    const data = await response.json()
    const rate = data.usd.clp

    if (!rate) {
      throw new Error('CLP rate not found')
    }

    return rate
  } catch (error) {
    console.error('Error fetching USD to CLP rate from CDN:', error)
    
    // Fallback a Cloudflare
    try {
      const fallbackResponse = await fetch(
        'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
        { next: { revalidate: 3600 } }
      )

      if (!fallbackResponse.ok) {
        throw new Error('Failed to fetch from fallback')
      }

      const fallbackData = await fallbackResponse.json()
      const fallbackRate = fallbackData.usd.clp

      if (!fallbackRate) {
        throw new Error('CLP rate not found in fallback')
      }

      return fallbackRate
    } catch (fallbackError) {
      console.error('Error fetching from fallback:', fallbackError)
      
      // Si todo falla, usar una tasa fija conservadora
      console.warn('Using fallback fixed rate: 950 CLP/USD')
      return 950
    }
  }
}

/**
 * Convierte USD a CLP usando la tasa actual
 */
export async function convertUsdToClp(usdAmount: number): Promise<number> {
  const rate = await getUsdToClpRate()
  return Math.round(usdAmount * rate)
}

/**
 * Convierte CLP a USD usando la tasa actual
 */
export async function convertClpToUsd(clpAmount: number): Promise<number> {
  const rate = await getUsdToClpRate()
  return clpAmount / rate
}
