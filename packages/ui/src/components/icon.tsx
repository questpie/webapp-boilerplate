'use client'

import { Icon as IconOg, loadIcon } from '@iconify/react'
import { use, useMemo, type PropsWithoutRef } from 'react'

export const Icon = (props: PropsWithoutRef<typeof IconOg> & { icon: string }) => {
  const icon = use(useMemo(() => loadIcon(props.icon), [props.icon]))

  return <IconOg {...props} icon={icon} ssr />
}
