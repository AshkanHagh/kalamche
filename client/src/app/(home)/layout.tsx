import Footer from "@/components/layout/Footer"
import InitUserLayout from "@/components/layout/InitUserLayout"
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
      <InitUserLayout>
        <div className="container">{children}</div>
      </InitUserLayout>
      <Footer />
    </>
  )
}
export default HomeLayout
