export interface BlogPost {
  title: string
  date: string
  description: string
  image: string
  alt: string
  ogImage: string
  category?: string
  categories?: string[]
  tags: string[]
  topics?: string[]
  published: boolean
  featured?: boolean
  youtube?: string
  audio?: string
}
