import { Navbar, NavLink } from "@/components/layout/Navbar"
import { navLinks } from "@/data/navLinks"
import Footer from "./Footer"

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

      <Footer />
    </div>
  )
}
export default MainLayout
