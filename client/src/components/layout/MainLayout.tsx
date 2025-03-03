import { Navbar, NavLink } from "@/components/layout/Navbar"
import { navLinks } from "@/data/navLinks"

type MainLayoutProps = {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div>
      <Navbar>
        {navLinks.map((nav) => (
          <NavLink key={nav.href} href={nav.href}>
            {nav.text}
          </NavLink>
        ))}
      </Navbar>
      {children}
    </div>
  )
}
export default MainLayout
