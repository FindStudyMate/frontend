import React, { useState, useEffect, useRef } from "react";
import './StudySearch.css';
import defaultProfile from "../../Assets/default.jpg";

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
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

function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = angle => (angle * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const StudySearch = () => {
    const [isActive, setIsActive] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const locationIntervalRef = useRef(null);
    const userFetchIntervalRef = useRef(null);
    const profileImgRefs = useRef({});

    useEffect(() => {
        return () => {
            profileImgRefs.current = {};
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
            if (userFetchIntervalRef.current) {
                clearInterval(userFetchIntervalRef.current);
            }
        };
    }, []);

    const updateStudyStatus = async (status) => {
        const token = getCookie("token");
        const email = getEmailFromJWT(token);
        
        try {
            const response = await fetch(`http://localhost:8017/api/user/updateStudy?email=${email}&study=${status}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to update study status');
            }
            
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        } catch (error) {
            console.error("Error updating study status:", error);
            throw error;
        }
    };

    const updateLocation = async () => {
        if (!navigator.geolocation) return;
    
        navigator.geolocation.getCurrentPosition(async (position) => {
            const token = getCookie("token");
            const email = getEmailFromJWT(token);
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
    
            try {
                const updateUrl = `http://localhost:8017/api/user/update/location?email=${encodeURIComponent(email)}&latitude=${latitude}&longitude=${longitude}`;
                
                await fetch(updateUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                console.error("Error updating location:", err);
            }
        }, error => {
            console.error("Geolocation error:", error.message);
        });
    };

    const fetchNearbyUsers = async () => {
        if (!userLocation) return;
        
        try {
            const response = await fetch("http://localhost:8017/api/user/studying");
            const data = await response.json();
            const token = getCookie("token");
            const email = getEmailFromJWT(token);

            const nearby = data
                .filter(user => {
                    if (user.email === email) return false;
                    const dist = calculateDistance(
                        userLocation.latitude, 
                        userLocation.longitude, 
                        user.latitude, 
                        user.longitude
                    );
                    return dist <= 5;
                })
                .map(user => ({
                    ...user,
                    distance: calculateDistance(
                        userLocation.latitude, 
                        userLocation.longitude, 
                        user.latitude, 
                        user.longitude
                    ).toFixed(2)
                }));

            setFilteredUsers(nearby);
        } catch (err) {
            console.error("Error fetching nearby users:", err);
        }
    };

    const toggleSearch = async () => {
        try {
            if (!isActive) {
                await updateStudyStatus("STUDYING");
                setIsActive(true);
                
                // Initial location update and user fetch
                await updateLocation();
                await fetchNearbyUsers();
                
                // Set up intervals:
                // Update location every minute (60000ms)
                locationIntervalRef.current = setInterval(updateLocation, 60000);
                
                // Fetch nearby users every 20 seconds (20000ms)
                userFetchIntervalRef.current = setInterval(fetchNearbyUsers, 20000);
            } else {
                await updateStudyStatus("NONSTUDYING");
                setIsActive(false);
                
                // Clear both intervals
                clearInterval(locationIntervalRef.current);
                clearInterval(userFetchIntervalRef.current);
                locationIntervalRef.current = null;
                userFetchIntervalRef.current = null;
                
                // Reset state
                setFilteredUsers([]);
                setUserLocation(null);
            }
        } catch (error) {
            console.error("Error toggling search:", error);
        }
    };

    const handleSayHello = (user) => {
        console.log("Say hello to:", user);
        // Implement your hello functionality here
    };

    return (
        <div className="container-study">
            <div className={`btn ${isActive ? 'active' : ''}`} onClick={toggleSearch}>
                <span>{isActive ? 'Stop Searching' : 'Find Studymate'}</span>
                <div className="dot"></div>
            </div>

            {isActive && (
                <div className="user-cards">
                    {filteredUsers.length === 0 ? (
                        <p style={{ color: "#ccc", marginTop: "2rem" }}>No study mates within 5km</p>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="user-card">
                                <div className="profile-img-wrapper">
                                    <img
                                        src={`http://localhost:8017/api/user/image/${user.email}`}
                                        alt={`${user.name}'s profile`}
                                        className="profile-img main-img"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            document.getElementById(`fallback-img-${user.id}`).style.display = 'block';
                                        }}
                                    />
                                    <img
                                        id={`fallback-img-${user.id}`}
                                        src={defaultProfile}
                                        alt="Default profile"
                                        className="profile-img fallback-img"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="user-info">
                                    <h3>{user.name}</h3>
                                    <p>Age: {user.age}</p>
                                    <p>Distance: {user.distance} km</p>
                                    <button 
                                        className="say-hello-btn"
                                        onClick={() => handleSayHello(user)}
                                    >
                                        Say Hello
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudySearch;