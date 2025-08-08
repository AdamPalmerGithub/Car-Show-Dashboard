import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from "./ShowList.module.css";

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
        <div className={styles.showList}>
            <h2 className={styles.heading}>Show List</h2>
            {shows.length === 0 ? (
                <p className={styles.noShows}>No shows found.</p>
            ) : (
                <ul className={styles.list}>
                    {shows.map((show, index) => (
                        <li key={index} className={styles.listItem}>
                            <div className={styles.showName}>{show.show_name}</div>
                            <div className={styles.detail}>Country: {show.show_country}</div>
                            <div className={styles.detail}>County: {show.show_county}</div>
                            <div className={styles.detail}>
                                Date: {new Date(show.show_date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </div>
                            <div className={styles.detail}>Ground ID: {show.show_ground_id}</div>
                            <Link to={`/show/${show.show_ground_id}`}>
                                <button className={styles.detailButton}>Detail & Entry</button>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 

    export default ShowList;
