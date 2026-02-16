import { siteDescription } from '../app/content'

export const navbarData = {
  homeTitle: 'Aaron Guo',
}

export const footerData = {
  author: 'Aaron Guo',
  aboutAuthor:
    'Product builder and engineer at a financial firm. I ship with AI daily and write about what works.',
  authorInterest: 'Real notes on product execution, AI-native systems, and building in public.',
  aboutTheSite:
    'I build with AI and write about what works. Product thinking, AI-native systems, and lessons from the trenches.',
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

export const seoData = {
  title: `Aaron Guo — Ship with AI, not about AI`,
  ogTitle: `Aaron Guo — Product leader who builds AI systems that do the work`,
  description: `Builder who ships with AI daily. Real notes on product execution, AI-native systems, and what actually works.`,
  twitterDescription: `Builder who ships with AI daily. Real notes on product execution, AI-native systems, and what actually works.`,
  mySite: 'https://aaronguo.com',
  twitterHandle: '@aaronguostudio',
  mailAddress: 'aaronguostudio@gmail.com',
}

export const socialLinks = {
  githubLink: 'https://github.com/aaronguostudio',
  linkedinLink: 'https://www.linkedin.com/in/aaron-guo',
  twitterLink: 'https://twitter.com/aaronguostudio',
  youtubeLink: 'https://www.youtube.com/@aaronguostudio',
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
  // {
  //   property: 'og:image',
  //   content: seoData.image,
  // },
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
  // {
  //   name: 'twitter:image',
  //   content: seoData.image,
  // },
]
