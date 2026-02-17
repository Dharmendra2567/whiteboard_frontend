import logo from "../assets/logo.png";

function Header() {
  return (
    <nav className="navbar bg-light shadow-sm" style={{ padding: "10px 0" }}>
      <div className="container justify-content-center">
        <span style={{
          fontSize: "24px",
          fontWeight: "800",
          background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Manrope', sans-serif"
        }}>
          Draw and Share You Thoughts
        </span>
      </div>
    </nav>
  );
}

export default Header;
