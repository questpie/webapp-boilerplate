'use client'
import { Icon as IconOg, loadIcon, type IconProps } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'

export function Icon(props: IconProps) {
  const iconQuery = useSuspenseQuery({
    queryKey: ['icon', String(props.icon)],
    queryFn: () => (typeof props.icon === 'string' ? loadIcon(String(props.icon)) : props.icon),
    // always cache first
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Number.POSITIVE_INFINITY,
  })

  return <IconOg {...props} icon={iconQuery.data} ssr />
}
