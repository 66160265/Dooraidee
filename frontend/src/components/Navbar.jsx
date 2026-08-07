import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <nav className="bg-[#36b9e9] shadow-[0_0_10px_rgba(0,0,0,0.2)] sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex justify-between items-center h-[60px]">
            <div className="logo">
              <Link to="/" className="text-white text-2xl">Dooraidee</Link>
            </div>
            <div className="menu">
              <ul className="flex gap-4">
                <li>
                  <Link to="/" className="text-white hover:opacity-80">หน้าแรก</Link>
                </li>
                <li>
                  <Link to="/movies" className="text-white hover:opacity-80">หนัง</Link>
                </li>
                <li>
                  <Link to="/tv-shows" className="text-white hover:opacity-80">ซีรีส์</Link>
                </li>
                <li>
                  <Link to="/anime" className="text-white hover:opacity-80">อนิเมะ</Link>
                </li>
                <li>
                  <Link to="/anime-calendar" className="text-white hover:opacity-80">ปฏิทินออกอากาศ</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
