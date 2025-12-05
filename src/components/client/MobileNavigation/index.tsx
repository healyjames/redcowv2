import { useState, useEffect } from "react";
import { ChartNoAxesColumn as Menu, X } from "lucide-react";
import "./MobileNavigation.css";

interface MobileNavProps {
    transparent?: boolean;
}

export default function MobileNav({ transparent }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
      if (open) {
          document.body.style.overflow = "hidden";
      } else {
          document.body.style.overflow = "visible";
      }

      return () => {
          document.body.style.overflow = "visible";
      };
  }, [open]);

  return (
      <nav
          className={`mobile-nav ${transparent && !open ? "mobile-nav-transparent" : ""} ${open ? "mobile-nav-open" : ""}`}
      >
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
              <div className="mobile-nav-content">
                  <ul className="mobile-nav-list">
                      <li className="mobile-nav-item">
                          <a href="/menu">Dine</a>
                      </li>
                      <li className="mobile-nav-item">
                          <a href="/rooms">Stay</a>
                      </li>
                      <li className="mobile-nav-item">
                          <a href="/events">Events</a>
                      </li>
                      <li className="mobile-nav-item">
                          <a href="/contact">Contact</a>
                      </li>
                  </ul>
                  <div>
                    <a
                        href="/booking"
                        className="button-tertiary reservation-button"
                        style={{ width: "100%" }}
                    >
                        Reservations
                    </a>
                  </div>
                  <div className="mobile-nav-footer">
                      <ul className="mobile-nav-footer-top">
                          <li>
                              <a href="/about">About</a>
                          </li>
                          <li>
                              <a href="/contact">Contact</a>
                          </li>
                      </ul>
                      <ul className="mobile-nav-footer-bottom">
                          <p>
                              Follow us on{" "}
                              <a
                                  href="https://www.facebook.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                  Facebook
                              </a>
                              ,{" "}
                              <a
                                  href="https://www.instagram.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                  Instagram
                              </a>{" "}
                              &amp;{" "}
                              <a
                                  href="https://www.tiktok.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                  TikTok
                              </a>
                          </p>
                      </ul>
                  </div>
              </div>
          )}
      </nav>
  );
}
