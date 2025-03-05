import Link from "next/link"
import { Separator } from "../ui/separator"
import Logo from "../svgs/logo"
import { footerLinks, socialLinks } from "@/data/footer"

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* first */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="size-7" />
              <span className="font-bold">Kalamche</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Kalamche helps you find the best deals from multiple retailers in
              one place.
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map(({ href, name, icon: Icon }, index) => (
                <Link key={index} href={href} className="text-muted-foreground">
                  <span className="sr-only">{name}</span>
                  <Icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>
          {/* first */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium">{section.title}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kalamche. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
