import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ShowList({ baseUrl }) {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Memoized fetch function using useCallback
    const fetchShows = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${baseUrl}/shows`);
            const data = response.data;

            // If data is an object (dictionary), convert it to array
            const formattedData = Array.isArray(data)
            ? data
            : Object.values(data);

            setShows(formattedData);
        } 
            catch (err) {
            console.error("Failed to fetch contacts:", err);
            if (err.response) {
                setError(`Error: ${err.response.status} - ${err.response.data || err.message}`);
            } else if (err.request) {
                setError("Network error: No response from server.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
        }   finally {
            setLoading(false);
        }
    }, [baseUrl]);

    // ✅ Fetch on component mount
    useEffect(() => {
        fetchShows();
    }, [fetchShows]);

    if (loading) return <p>Loading shows...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Show List</h2>
            {shows.length === 0 ? (
            <p>No shows found.</p>
            ) : (
            <ul>
                {shows.map((show, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>
                    <strong>{show.show_name}</strong><br />
                    Country: {show.show_country}<br />
                    County: {show.show_county}<br />
                    Date: {show.show_date}<br />
                    Ground ID: {show.show_ground_id}<br />
                    <Link to={`/show/${show.show_ground_id}`}>
                        <button>Detail & Entry</button>
                    </Link>
                </li>
                ))}
            </ul>
            )}
        </div>
    );
} 

    export default ShowList;
