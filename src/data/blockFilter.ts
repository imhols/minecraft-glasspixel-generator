export interface FilterCategory {
  id: string
  labelKey: string
  blocks: string[]
}

export const FILTER_CATEGORIES: FilterCategory[] = [
  { id: 'wool', labelKey: 'config.blockFilter.wool', blocks: [] },
  { id: 'carpet', labelKey: 'config.blockFilter.carpet', blocks: [] },
  { id: 'glass', labelKey: 'config.blockFilter.glass', blocks: [] },
  { id: 'concrete', labelKey: 'config.blockFilter.concrete', blocks: [] },
  { id: 'terracotta', labelKey: 'config.blockFilter.terracotta', blocks: [] },
  { id: 'mineral', labelKey: 'config.blockFilter.mineral', blocks: [] },
  { id: 'others', labelKey: 'config.blockFilter.others', blocks: [] },
]
