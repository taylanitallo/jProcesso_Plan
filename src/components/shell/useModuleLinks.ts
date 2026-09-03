import { useEffect } from 'react'
import { useUi, type ModuleLink } from '../../store/ui'

/** Registers the TopBar context icons for the active module; clears on unmount. */
export function useModuleLinks(links: ModuleLink[]) {
  const setModuleLinks = useUi((s) => s.setModuleLinks)
  useEffect(() => {
    setModuleLinks(links)
    return () => setModuleLinks([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(links)])
}
