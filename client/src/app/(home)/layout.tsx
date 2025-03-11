import Footer from "@/components/layout/Footer"
import { Navbar, NavLink } from "@/components/layout/Navbar"
import { navLinks } from "@/data/navLinks"

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar>
        {navLinks.map((nav) => (
          <NavLink key={nav.href} href={nav.href}>
            {nav.text}
          </NavLink>
        ))}
      </Navbar>
      <div className="container">{children}</div>
      <Footer />
    </>
  )
}
export default HomeLayout
