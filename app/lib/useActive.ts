import { usePathname } from "next/navigation";

function normalizePath(p: string | null | undefined) {
  if (!p) return "";
  // remove trailing slashes, normalize to lowercase
  return p.replace(/\/+$/, "").toLowerCase();
}

export function useIsActive() {
  const pathname = usePathname();
  const np = normalizePath(pathname);

  return (href: string) => {
    const nh = normalizePath(href);

    // root special case: href = "/" should match only root
    if (nh === "") return np === "";

    // exact match or a sub-route match (e.g. /user-dashboard and /user-dashboard/edit)
    return np === nh || np.startsWith(nh + "/");
  };
}
