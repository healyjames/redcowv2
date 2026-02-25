import { useState, useEffect } from "react";
import { ChartNoAxesColumn as Menu, X } from "lucide-react";
import { mainNavigation, socialLinks, businessInfo } from "@brand/content";
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
                  {businessInfo.logoText}
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
                      {mainNavigation.map(link => (
                          <li key={link.href} className="mobile-nav-item">
                              <a href={link.href}>{link.text}</a>
                          </li>
                      ))}
                  </ul>
                  <div>
                      <a
                          href={businessInfo.reservationsUrl}
                          className="btn btn-primary reservation-button mobile-nav-reservation-button"
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
                              {socialLinks.map((social, index) => (
                                  <span key={social.name}>
                                      <a
                                          href={social.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                      >
                                          {social.name}
                                      </a>
                                      {index < socialLinks.length - 1 && (index === socialLinks.length - 2 ? " & " : ", ")}
                                  </span>
                              ))}
                          </p>
                      </ul>
                  </div>
              </div>
          )}
      </nav>
  );
}
