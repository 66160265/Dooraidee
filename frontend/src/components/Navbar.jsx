import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/", label: "หน้าแรก" },
  { to: "/movies", label: "หนัง" },
  { to: "/tv-shows", label: "ซีรีส์" },
  { to: "/anime", label: "อนิเมะ" },
  { to: "/anime-calendar", label: "ปฏิทินออกอากาศ" },
];

function LogoMark() {
  return (
    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </span>
  );
}

function Navbar() {
  const location = useLocation();

  return (
    <header>
      <nav className="bg-[#36b9e9]/90 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.15)] sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex justify-between items-center h-[64px]">
            <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              <LogoMark />
              Dooraidee
            </Link>
            <ul className="flex gap-1">
              {LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`relative px-3 py-2 text-sm md:text-base rounded-lg font-medium transition-colors ${
                        active ? "text-white bg-white/15" : "text-white/85 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute left-3 right-3 -bottom-[1px] h-0.5 rounded-full bg-white" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
