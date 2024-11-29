import { Domain, Site, SubdomainType, User } from '@prisma/client'

export type SiteWithDomains = Site & { domains: Domain[] }

export type UserWithDomains = User & {
  sites: SiteWithDomains[]
}

export function getSiteDomain(site: SiteWithDomains) {
  const domains = site.domains
  const customDomain = domains.find((d) => !d.isSubdomain)

  if (customDomain) {
    return {
      domain: customDomain.domain,
      isSubdomain: false,
    }
  }

  const sortedDomains = sortDomains(domains)

  return {
    domain: sortedDomains[0]?.domain,
    isSubdomain: true,
  }
}

export function getSiteSubdomain(site: SiteWithDomains) {
  const domains = site.domains
  const item = domains.find(
    (d) => d.isSubdomain && d.subdomainType === SubdomainType.Custom,
  )
  return item?.domain || ''
}

export function getSiteCustomDomain(site: SiteWithDomains) {
  const domains = site.domains
  const item = domains.find((d) => !d.isSubdomain)
  return item?.domain || ''
}

function sortDomains(domains: Domain[]): Domain[] {
  const sortKeys = [
    SubdomainType.Custom,
    SubdomainType.EnsName,
    SubdomainType.FarcasterName,
    SubdomainType.Address,
    SubdomainType.UserId,
  ]

  return domains.sort((a, b) => {
    const indexA = sortKeys.indexOf(a.subdomainType)
    const indexB = sortKeys.indexOf(b.subdomainType)

    // If both types are found in sortKeys, sort by their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only one type is found, it should come first
    if (indexA === -1) return 1 // a comes after b
    if (indexB === -1) return -1 // b comes after a

    return 0 // If both are not found, maintain original order
  })
}
