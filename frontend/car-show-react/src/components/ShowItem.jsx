import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CarsAtShow from './CarsAtShow';

function ShowItem({ baseUrl }) {
    const { id } = useParams(); // Get show ID from URL
    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShow = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${baseUrl}/show/${id}`);
                setShow(response.data);
            } catch (err) {
                if (err.response) {
                    setError(`Error: ${err.response.status} - ${err.response.data || err.message}`);
                } else if (err.request) {
                    setError("Network error: No response from server.");
                } else {
                    setError(err.message || "An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchShow();
    }, [baseUrl, id]);

    if (loading) return <p>Loading show...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!show) return <p>No show found.</p>;

    return (
        <div>
            <h2>{show.show_name}</h2>
            <p>Country: {show.show_country}</p>
            <p>County: {show.show_county}</p>
            <p>Postcode: {show.show_postcode}</p>
            <p>Date: {show.show_date}</p>
            <p>Description: {show.show_description}</p>
            <CarsAtShow baseUrl={baseUrl} showGroundId={show.show_ground_id} />
        </div>
    );
}

export default ShowItem;
