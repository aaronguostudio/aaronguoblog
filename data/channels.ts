export interface YouTubeChannel {
  id: string
  nameKey: string
  descriptionKey: string
  ctaKey: string
  url: string
  icon: string
  iconBgClass: string
  logo?: string
  internalPath?: string
}

export const youtubeChannels: YouTubeChannel[] = [
  {
    id: 'ai-native-builder',
    nameKey: 'channels.aiNativeBuilder.name',
    descriptionKey: 'channels.aiNativeBuilder.description',
    ctaKey: 'channels.watchOnYouTube',
    url: 'https://www.youtube.com/@ai-native-builder',
    icon: 'heroicons:cpu-chip',
    iconBgClass: 'bg-blue-600',
    logo: '/ai-native-builder-avatar.jpg',
  },
  {
    id: 'drum',
    nameKey: 'channels.drum.name',
    descriptionKey: 'channels.drum.description',
    ctaKey: 'channels.explore',
    url: 'https://www.youtube.com/@drumnext',
    icon: 'mdi:music-circle',
    iconBgClass: 'bg-amber-600',
    logo: '/drum-next-avatar.jpg',
  },
  {
    id: 'visual-and-sound',
    nameKey: 'channels.visualAndSound.name',
    descriptionKey: 'channels.visualAndSound.description',
    ctaKey: 'channels.watchOnYouTube',
    url: 'https://www.youtube.com/@visual-and-sound',
    icon: 'heroicons:sparkles',
    iconBgClass: 'bg-violet-600',
    logo: '/visual-and-sound.jpg',
  },
]
