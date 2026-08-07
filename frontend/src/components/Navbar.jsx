import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <nav>
        <div className="nav-container">
          <div className="nav-con">
            <div className="logo">
              <Link to="/">Dooraidee</Link>
            </div>
            <div className="menu">
              <ul>
                <li>
                  <Link to="/">หน้าแรก</Link>
                </li>
                <li>
                  <Link to="/movies">หนัง</Link>
                </li>
                <li>
                  <Link to="/tv-shows">ซีรีส์</Link>
                </li>
                <li>
                  <Link to="/anime">อนิเมะ</Link>
                </li>
                <li>
                  <Link to="/anime-calendar">ปฏิทินออกอากาศ</Link>
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
