import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export const metadata = { title: "Community Events Board" };

export default function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand" href="/" aria-label="Community Events Board home">
          <span className="brand-mark"><CalendarDays size={19} strokeWidth={2.2} /></span>
          <span>around<span className="brand-dot">.</span></span>
        </Link>
        <nav className="home-nav" aria-label="Account">
          <Link className="nav-login" href="/login">Log in</Link>
          <Link className="nav-signup" href="/signup">Create account <ArrowUpRight size={16} /></Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEIGHBOURHOOD, IN GOOD COMPANY</p>
          <h1>Good things happen <em>close to home.</em></h1>
          <p className="home-description">Find the little moments that make a city feel like yours: live music, hands-on workshops, food worth sharing, and more.</p>
          <Link className="primary-link" href="/signup">Find your people <ArrowUpRight size={18} /></Link>
          <p className="home-footnote">A community events board for the curious and the local.</p>
        </div>

        <figure className="home-image-wrap">
          <Image
            className="home-image"
            src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85"
            alt="Friends gathered together at an outdoor live music event"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 52vw"
          />
          <figcaption className="image-caption">
            <span className="caption-kicker">MAKE THE MOST OF HERE</span>
            <span className="caption-title">A good night is closer than you think.</span>
          </figcaption>
          <span className="image-index" aria-hidden="true">01 / 05</span>
        </figure>
      </section>

      <footer className="home-footer">
        <span>GOOD PLANS, RIGHT AROUND THE CORNER</span>
        <div className="category-list" aria-label="Event categories">
          <span>Music</span><span>Workshops</span><span>Food</span><span>Sports</span><span>Kids</span>
        </div>
      </footer>
    </main>
  );
}