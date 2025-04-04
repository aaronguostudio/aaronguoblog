import { siteDescription } from '../app/content'

export const navbarData = {
  homeTitle: 'Aaron Guo',
}

export const footerData = {
  author: 'Aaron Guo',
  aboutAuthor:
    'Hi! I am Aaron, a tech enthusiast, head of products and software engineer. Currently working at Mawer Investment Management.',
  authorInterest: 'I have a fair amount of knowledge of Javascript, Typescript, VueJs, and Nuxt.',
  aboutTheSite: `This is a personal blog site built with Nuxt3, TailwindCSS, NuxtContent, Nuxt Icon. I built it based on the <a href="https://github.com/nurRiyad/nuxt-blog" target="_blank" class="text-blue-500">Nuxt Blog template</a>.`,
}

export const homePage = {
  title: 'Welcome',
  description: siteDescription,
}

export const blogsPage = {
  title: 'All Blogs',
  description: 'Here you will find all the blog posts I have written & published on this site.',
}

export const categoryPage = {
  title: 'Categories',
  description:
    'Blow this category is generated from all the tags are mentioned in the different blog post',
}

// export const aboutPage = {
//   title: 'Aaron Guo',
//   description: 'Software Engineer, Problem Solver, Web Enthusiast.',
//   aboutMe:
//     "Hi there! I'm Aaron, juggling pixels and product roadmap as a Head of Products & Software Engineer at Mawer Investment Management. By day, I wrangle complex challenges in the investment world; by night (and often weekends!), you'll find me diving deep into the realms of Javascript, Typescript, Vue, and Nuxt, always eager to build something new or solve a tricky puzzle. Welcome to my corner of the web where I share my explorations and insights!",
// }

export const seoData = {
  title: `Aaron Guo | Aaron Guo Blog`,
  ogTitle: `Let's learn Javascript, Typescript, Vue, Nuxt, & Problem Solving - Aaron Guo Blog | Aaron Guo Blog`,
  description: `Hi I am Aaron. A Software Engineer at FieldNation, with over 3.5+ years experience in software development. - Aaron Guo Blog | Aaron Guo Blog`,
  twitterDescription: `Aaron Guo Blog, where I play around with Nuxt, Vue, and more and showcase my blog, resources, etc - Aaron Guo Blog | Aaron Guo Blog`,
  image:
    'https://res.cloudinary.com/dmecmyphj/image/upload/v1673548905/nuxt-blog/cover_ntgs6u.webp',
  mySite: 'https://aaronguostudio.com',
  twitterHandle: '@aaronguostudio',
  mailAddress: 'aaronguostudio@gmail.com',
}

export const socialLinks = {
  githubLink: 'https://github.com/nurRiyad',
  linkedinLink: 'https://www.linkedin.com/in/nur-riyad/',
  twitterLink: 'https://twitter.com/qdnvubp',
  stackoverflowLink: 'https://stackoverflow.com/users/16781395/nur-riyad',
}

export const siteMetaData = [
  {
    name: 'description',
    content: seoData.description,
  },
  // Test on: https://developers.facebook.com/tools/debug/ or https://socialsharepreview.com/
  { property: 'og:site_name', content: seoData.mySite },
  { property: 'og:type', content: 'website' },
  {
    property: 'og:url',
    content: seoData.mySite,
  },
  {
    property: 'og:title',
    content: seoData.ogTitle,
  },
  {
    property: 'og:description',
    content: seoData.description,
  },
  {
    property: 'og:image',
    content: seoData.image,
  },
  // Test on: https://cards-dev.twitter.com/validator or https://socialsharepreview.com/
  { name: 'twitter:site', content: seoData.twitterHandle },
  { name: 'twitter:card', content: 'summary_large_image' },
  {
    name: 'twitter:url',
    content: seoData.mySite,
  },
  {
    name: 'twitter:title',
    content: seoData.ogTitle,
  },
  {
    name: 'twitter:description',
    content: seoData.twitterDescription,
  },
  {
    name: 'twitter:image',
    content: seoData.image,
  },
]
