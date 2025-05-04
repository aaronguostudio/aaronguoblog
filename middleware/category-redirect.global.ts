export default defineNuxtRouteMiddleware((to) => {
  // Check if the route is a category page
  if (to.path.startsWith('/categories/')) {
    // Extract the category name from the path
    const categoryName = to.params.category

    if (categoryName) {
      // Redirect to the blogs page with the category as a query parameter
      return navigateTo(
        {
          path: '/blogs',
          query: { categories: categoryName },
        },
        { redirectCode: 301 },
      )
    }
  }

  // Check if the route is the categories index page
  if (to.path === '/categories') {
    // Redirect to the blogs page
    return navigateTo('/blogs', { redirectCode: 301 })
  }
})
