import { useQuery } from '@tanstack/react-query'
import type { BibleData } from '../types/bible'

const TRANSLATION_SOURCES = {
  kor: '/data/korean_bible.json',
  kjv: '/data/kjv_bible.json'
} as const

export type TranslationKey = keyof typeof TRANSLATION_SOURCES

const fetchTranslation = async (translation: TranslationKey): Promise<BibleData> => {
  const response = await fetch(TRANSLATION_SOURCES[translation], { cache: 'force-cache' })
  if (!response.ok) {
    throw new Error(`failed to fetch ${translation} bible data`)
  }
  return (await response.json()) as BibleData
}

export const useBibleTranslation = (translation: TranslationKey) =>
  useQuery({
    queryKey: ['bible-data', translation],
    queryFn: () => fetchTranslation(translation),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false
  })
