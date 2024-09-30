'use client'
import type { OrganizationWithRole } from '@questpie/api/modules/organizations/services/organizations.service'
import { setOrganization } from '@questpie/app/app/(main)/organizations/organization.actions'
import { AtomsHydrator } from '@questpie/app/app/_atoms/atoms-provider'
import { getRootStore } from '@questpie/app/app/_atoms/root-store'
import { atom, useAtomValue } from 'jotai'
import { useEffect, type PropsWithChildren } from 'react'

export const organizationAtom = atom<OrganizationWithRole | null>(null)

export function getSelectedOrganizationId() {
  return getRootStore().get(organizationAtom)?.id
}

export function OrganizationProvider(
  props: PropsWithChildren<{ organization: OrganizationWithRole }>
) {
  useEffect(() => {
    if (props.organization?.id) {
      setOrganization(props.organization.id)
    }
  }, [props.organization?.id])

  return (
    <AtomsHydrator atomValues={[[organizationAtom, props.organization]]}>
      {props.children}
    </AtomsHydrator>
  )
}

export function useSelectedOrganization() {
  return useAtomValue(organizationAtom)
}
