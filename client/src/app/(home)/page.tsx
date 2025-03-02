import HeroSection from "./_components/HeroSection"
import SearchBar from "./_components/SearchBar"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <SearchBar />
        <HeroSection />
      </main>
    </div>
  )
}
