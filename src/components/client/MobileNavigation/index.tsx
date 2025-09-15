import { useState } from "react";
import { ChartNoAxesColumn as Menu, X } from "lucide-react";
import "./MobileNavigation.css";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
      <nav className="mobile-nav">
          <div className="mobile-nav-header">
              <a href="/" className="mobile-nav-logo">
                  The Red Cow
              </a>
              <button
                  className="mobile-menu-toggle"
                  onClick={() => setOpen(!open)}
                  aria-label="Toggle menu"
              >
                  {open ? (
                      <X size={28} />
                  ) : (
                      <Menu size={28} style={{ transform: "rotate(-90deg)" }} />
                  )}
              </button>
          </div>

          {open && (
            <ul className="mobile-nav-list">
                <li className="mobile-nav-item">
                    <a href="/dine">Dine</a>
                </li>
                <li className="mobile-nav-item">
                    <a href="/stay">Stay</a>
                </li>
                <li className="mobile-nav-item">
                    <a href="/events">Events</a>
                </li>
                <li className="mobile-nav-item">
                    <a href="/contact">Contact</a>
                </li>
            </ul>
          )}
      </nav>
  );
}
