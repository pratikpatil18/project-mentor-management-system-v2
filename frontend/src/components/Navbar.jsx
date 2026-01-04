import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    const userData = JSON.parse(localStorage.getItem("userData")) || {};

    setUserType(storedUserType || "");

    const resolvedName =
      userData.name ||
      userData.mentor_name ||
      userData.username ||
      userData.admin_name ||
      "User";

    setUserName(resolvedName);
  }, []);


  const getNavTitle = () => {
    switch(userType) {
      case 'admin':
        return 'Admin Portal';
      case 'mentor':
        return 'Mentor Portal';
      case 'student':
        return 'Student Portal';
      default:
        return 'Mentor Project Portal';
    }
  };

  const navbarStyle = {
    backgroundColor: '#141414', // Netflix dark background
    color: '#fff', // White text
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#e50914',
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const userAvatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e50914',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  const linkStyle = {
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "0.3s",
  };


  return (
    <nav style={navbarStyle}>
      <h1 style={logoStyle}>{getNavTitle()}</h1>

      {userType && (
        <div style={userInfoStyle}>
          <div style={userAvatarStyle}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span>{userName}</span>
        </div>
      )}
    </nav>
  );
  };

export default Navbar;