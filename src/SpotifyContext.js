import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const SpotifyContext = createContext();

// Konfiguracija Axios-a sa baznim URL-om i CORS podešavanjima
const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const SpotifyProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('spotify_token'));
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Prvo proverimo da li je backend server dostupan
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                console.log("Checking server availability...");
                const response = await api.get('/ping');
                console.log("Server status:", response.data);
            } catch (err) {
                console.error("Server connection error:", err);
                setError("Server nije dostupan. Proverite da li je backend pokrenut na http://localhost:5000");
            }
        };

        checkServerStatus();
    }, []);

    useEffect(() => {
        const handleAuthCode = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                try {
                    setLoading(true);
                    console.log("Exchanging code for token...");

                    const response = await api.get(`/callback?code=${code}`);
                    const { access_token } = response.data;

                    if (access_token) {
                        console.log("Token received and storing...");
                        localStorage.setItem('spotify_token', access_token);
                        setToken(access_token);
                        await fetchUserData(access_token);
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error("Authentication error:", error);
                    setError("Greška pri autentikaciji");
                    logout();
                } finally {
                    setLoading(false);
                }
            }
        };

        handleAuthCode();
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem('spotify_token');
        console.log("Checking stored token:", storedToken ? "Token exists" : "No token");
        if (storedToken) {
            setToken(storedToken);
            fetchUserData(storedToken);
        }
    }, []);

    const fetchUserData = async (accessToken) => {
        try {
            console.log("Fetching user data with token:", accessToken);
            const headers = { Authorization: accessToken };

            const [profileResponse, tracksResponse, artistsResponse, playlistsResponse] = await Promise.all([
                api.get('/api/user/profile', { headers }),
                api.get('/api/user/top-tracks', { headers }),
                api.get('/api/user/top-artists', { headers }),
                api.get('/api/user/playlists', { headers })
            ]);

            console.log("Profile response:", profileResponse.data);
            console.log("Tracks response:", tracksResponse.data);
            console.log("Artists response:", artistsResponse.data);
            console.log("Playlists response:", playlistsResponse.data);

            setUserData({
                ...profileResponse.data,
                top_tracks: tracksResponse.data.items || [],
                top_artists: artistsResponse.data.items || [],
                playlists: playlistsResponse.data.items || []
            });
        } catch (err) {
            console.error("Failed to load user data:", err);
            if (err.response?.status === 401) {
                console.log("Unauthorized access, logging out");
                logout();
            }
            setError("Greška pri učitavanju podataka");
        }
    };

    const login = useCallback(() => {
        console.log("Starting login process...");
        setLoading(true);
        setError(null);

        api.get('/login')
            .then(({ data }) => {
                console.log("Redirecting to Spotify auth:", data.auth_url);
                localStorage.removeItem('spotify_token');
                localStorage.removeItem('spotify_refresh_token');
                setToken(null);
                setUserData(null);
                window.location.href = data.auth_url;
            })
            .catch(err => {
                console.error("Login error:", err);
                setError(err.response?.data?.error || `Prijava nije uspela: ${err.message}`);
                setLoading(false);
            });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_refresh_token');
        setToken(null);
        setUserData(null);
        window.location.href = '/';
    }, []);

    return (
        <SpotifyContext.Provider value={{
            token,
            userData,
            loading,
            error,
            login,
            logout
        }}>
            {children}
        </SpotifyContext.Provider>
    );
};