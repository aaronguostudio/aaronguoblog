export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email = body?.email?.trim()

  // Validate email
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Check that Beehiiv credentials are configured
  if (!config.beehiivApiKey || !config.beehiivPublicationId) {
    console.error('Beehiiv API key or publication ID is not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Newsletter service is not configured',
    })
  }

  try {
    const response = await $fetch<{ data: { id: string; email: string; status: string } }>(
      `https://api.beehiiv.com/v2/publications/${config.beehiivPublicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.beehiivApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'aaronguo.com',
          utm_medium: 'website',
          referring_site: 'https://aaronguo.com',
        },
      },
    )

    return {
      success: true,
      message: 'Subscribed successfully',
      status: response?.data?.status || 'active',
    }
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      response?: { status?: number; _data?: Record<string, unknown> }
      data?: { message?: string; errors?: { message?: string }[] }
      message?: string
    }
    const statusCode = err?.statusCode || err?.response?.status || 500
    const responseData = err?.data || (err?.response?._data as Record<string, unknown>) || {}
    const errorMessage =
      (responseData?.errors as { message?: string }[] | undefined)?.[0]?.message ||
      (responseData?.message as string | undefined) ||
      err?.message ||
      'Failed to subscribe'

    console.error('Beehiiv API error:', {
      statusCode,
      message: errorMessage,
      responseData,
      email,
    })

    // Handle specific Beehiiv error cases
    if (statusCode === 409) {
      return {
        success: true,
        message: 'Already subscribed',
        status: 'existing',
      }
    }

    if (statusCode === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }

    throw createError({
      statusCode: statusCode >= 500 ? 500 : statusCode,
      statusMessage: errorMessage,
    })
  }
})
