import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";

const DEFAULT_PROFILE_IMAGE =
  "https://github-production-user-asset-6210df.s3.amazonaws.com/111465147/433094639-e9ea29bb-f404-4e91-b516-14e39068581e.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250413%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250413T023429Z&X-Amz-Expires=300&X-Amz-Signature=a34a26651c5814d94621e585cbae255fa9be8930f4d0b8de74f35ea3fdcf6441&X-Amz-SignedHeaders=host";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
function signout() {
  
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.replace("/");
}
async function uploadImage() {
  const file = document.getElementById("chooseFile").files[0];
  const formData = new FormData();
  formData.append('username', username);
  formData.append('image', file);
  try {
      const imageUploadResponse = await fetch(imageUploadUrl, {
          method: "POST",
          body: formData
      });
      if (imageUploadResponse.ok) {
          console.log("Image uploaded successfully");          
          location.href = "/skatepark.co/";
      } else {
          console.error("Image upload failed");
      }
  } catch (error) {
      console.error("Error uploading image:", error);
  }
}

function getEmailFromJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT");
    const payload = parts[1];
    const padding = "=".repeat((4 - (payload.length % 4)) % 4);
    const base64 = (payload + padding).replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    return decoded.sub || null;
  } catch (e) {
    console.error("Invalid JWT:", e);
    return null;
  }
}

function NavBar() {
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);
  const [name, setUserName] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/");
  };
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      const userEmail = getEmailFromJWT(token);
      if (userEmail) {
        const fetchUserData = async (email) => {
          try {
            const userResponse = await fetch(
              `http://localhost:8017/api/user/get/${email}`
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUserName(userData.name || email); // fallback to email
            } else {
              setUserName(email); // fallback to email if fetch fails
            }

            setImageSrc(`http://localhost:8017/api/user/image/${email}`);
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserName(email);
            setImageSrc(DEFAULT_PROFILE_IMAGE);
          }
        };

        fetchUserData(userEmail);
      }
    }
  }, []);

  useEffect(() => {
    const scrollHandler = () => {
      updateNavbar(window.scrollY >= 20);
    };

    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const handleImageError = () => {
    setImageSrc(DEFAULT_PROFILE_IMAGE);
  };

  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="md"
      className={navColour ? "sticky" : "navbar"}
    >
      <Container>
        {name && (
          <div className="d-flex align-items-center me-auto text-white">
            <img
              id="profile-img"
              src={imageSrc}
              onError={handleImageError}
              alt="Profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #2B3856",
                marginRight: "10px",
              }}
            />
            <h5 style={{ margin: 0 }}>{name}</h5>
          </div>
        )}

        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => updateExpanded(expand ? false : "expanded")}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            {name ? (
              <>
               <Nav.Item>
                  <Nav.Input
                   type="file" id="chooseFile" name="chooseFile" accept="image/*" onchange="loadFile(this)"
                  >
                    Upload Profile
                  </Nav.Input>
               </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/"
                    onClick={() => updateExpanded(false)}
                  >
                    Home
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/logout"
                    onClick={(e) => { e.preventDefault(); signout(); updateExpanded(false);}}
                  >
                    Logout
                  </Nav.Link>
                </Nav.Item>
              </>
            ) : (
              <>
              <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/"
                    onClick={() => updateExpanded(false)}
                  >
                    Home
                  </Nav.Link>
                </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to="/login"
                  onClick={() => updateExpanded(false)}
                >
                  Login
                </Nav.Link>
              </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
