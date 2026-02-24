export interface BlogPost {
  title: string
  date: string
  description: string
  image: string
  alt: string
  ogImage: string
  tags: string[]
  topics?: string[]
  published: boolean
  featured?: boolean
  youtube?: string
  audio?: string
}
