import React, { useState, useEffect, useCallback } from 'react';
import styles from './CarsAtShow.module.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import DeleteCar from './DeleteCarFromShow';
import UpdateCar from './UpdateCar';

function CarsAtShow({ baseUrl, showGroundId }) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchCarsAtShow = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${baseUrl}/cars/${showGroundId}`);
            const data = response.data;
            setCars(Array.isArray(data) ? data : Object.values(data));
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
    }, [baseUrl, showGroundId]);

    useEffect(() => {
        fetchCarsAtShow();
    }, [fetchCarsAtShow]);

    if (loading) return <p>Loading cars...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
<div className={styles.container}>
    <h2 className={styles.heading}>Cars at show</h2>
    <button 
        className={styles.addButton}
        onClick={() => navigate('/addcar', {
            state: { from: location.pathname, show_ground_id: showGroundId }
        })}
    >
        Add Car
    </button>

    {cars.length === 0 ? (
        <p className={styles.noCars}>No cars found.</p>
    ) : (
        <ul className={styles.carList}>
            {cars.map((car) => (
                <li key={car.car_id} className={styles.carItem}>
                    <p><strong>Brand:</strong> {car.car_brand}</p>
                    <p><strong>Model:</strong> {car.car_model}</p>
                    <p><strong>Year:</strong> {car.car_year ? new Date(car.car_year).getFullYear() : ''}</p>
                    <p><strong>Registration:</strong> {car.car_reg}</p>
                    <div className={styles.carActions}>
                        <UpdateCar car={car} baseUrl={baseUrl} onUpdated={fetchCarsAtShow} />
                        <DeleteCar carId={car.car_id} showGroundId={showGroundId} baseUrl={baseUrl} onDeleted={fetchCarsAtShow} />
                    </div>
                </li>
            ))}
        </ul>
    )}
</div>


    );
}

export default CarsAtShow;