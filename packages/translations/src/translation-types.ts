import type { LeafPaths } from '@questpie/shared/types/data'
import type { allTranslations } from '@questpie/translations/index'

export type TranslationsRaw = keyof (typeof allTranslations)['en']

export type TranslationKey = LeafPaths<TranslationsRaw>
