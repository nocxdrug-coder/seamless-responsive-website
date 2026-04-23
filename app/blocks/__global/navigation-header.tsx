import { useState } from "react";
import { Link, NavLink } from "react-router";
import classNames from "classnames";
import styles from "./navigation-header.module.css";

interface Props {
  className?: string;
  isAuthenticated?: boolean;
}

const NAV_LINKS = [
  { label: "Features", to: "/features", protected: false },
  { label: "Products", to: "/products", protected: false },
  { label: "Support", to: "/support", protected: false },
];

export function NavigationHeader({ className, isAuthenticated }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = () => {
    closeMenu();
  };

  return (
    <>
      <header className={classNames(styles.header, className)}>
        <div className={styles.inner}>
          <Link to="/" className={`${styles.logo} logo`} onClick={closeMenu}>
            <img src="/logo.png?v=2" alt="Heaven Card logo" className={styles.logoImage} />
            <div className={styles.logoText}>
              <span className={styles.logoName}>Heaven Card</span>
              <span className={styles.logoTagline}>Next-Gen Payments</span>
            </div>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => classNames(styles.navLink, { [styles.active]: isActive })}
                onClick={handleNavClick}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={styles.loginBtn}>Go to Dashboard</Link>
                <Link to="/cards" className={styles.registerBtn}>Shop Now</Link>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>Login</Link>
                <Link to="/register" className={styles.registerBtn}>Register</Link>
              </>
            )}
          </div>

          <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </header>

      <div className={classNames(styles.mobileMenu, { [styles.open]: menuOpen })}>
        {(isAuthenticated
          ? [
              { label: "Dashboard", to: "/dashboard" },
              { label: "Support", to: "/support" },
              { label: "Products", to: "/products" },
              { label: "Features", to: "/features" },
            ]
          : [
              { label: "Support", to: "/support" },
              { label: "Products", to: "/products" },
              { label: "Features", to: "/features" },
            ]).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={styles.mobileNavLink}
            onClick={handleNavClick}
          >
            {link.label}
          </Link>
        ))}
        <div className={styles.mobileActions}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.mobilePrimaryBtn} onClick={closeMenu}>Go to Dashboard</Link>
              <Link to="/cards" className={styles.mobileSecondaryBtn} onClick={closeMenu}>Shop Now</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileSecondaryBtn} onClick={closeMenu}>Login</Link>
              <Link to="/register" className={styles.mobilePrimaryBtn} onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
