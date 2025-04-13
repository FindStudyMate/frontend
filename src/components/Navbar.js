import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
function getEmailFromJWT(token) {
  try {
    // Split the token into parts (header, payload, signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the Base64Url-encoded payload
    const payload = parts[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    const parsedPayload = JSON.parse(decodedPayload);

    // Extract the email (assuming it's in the 'sub' field)
    const email = parsedPayload.sub;
    if (!email) {
      throw new Error('No email (sub) found in JWT payload');
    }

    return email;
  } catch (error) {
    console.error('Error decoding JWT:', error.message);
    return null;
  }
}
function NavBar() {
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);

  function scrollHandler() {
    if (window.scrollY >= 20) {
      updateNavbar(true);
    } else {
      updateNavbar(false);
    }
  }

  window.addEventListener("scroll", scrollHandler);
  useEffect(() => {
      const token = getCookie("token");
      if (token) {
          document.getElementById("topline").innerHTML =  
          ``;
      }
  }, []);
  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="md"
      className={navColour ? "sticky" : "navbar"}
    >
      <Container>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => {
            updateExpanded(expand ? false : "expanded");
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav id = "topline" className="ms-auto" defaultActiveKey="#home">
            <Nav.Item>
              <Nav.Link as={Link} to="/" onClick={() => updateExpanded(false)}>
                 Home
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/login" onClick={() => updateExpanded(false)}>
                 Login
              </Nav.Link>
            </Nav.Item>
            
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
