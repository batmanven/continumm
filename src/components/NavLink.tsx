import { NavLink as RouterNavLink, NavLinkProps, useLocation } from "react-router-dom";
import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const { setOpenMobile } = useSidebar();
    const location = useLocation();

    // Auto-close mobile sidebar when navigating
    const handleClick = () => {
      // Check if we're on mobile (sidebar is in mobile state)
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setOpenMobile(false);
      }
    };

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          )
        }
        onClick={handleClick}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
