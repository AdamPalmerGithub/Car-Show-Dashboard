import React, { useState } from 'react';
import styles from './AddCar.module.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function AddCar({ baseUrl }) {
    const [formData, setFormData] = useState({
        car_brand: '',
        car_model: '',
        car_year: '',
        car_reg: '',
        owner_email: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const show_ground_id = location.state?.show_ground_id; // Passed from CarsAtShow

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.car_brand.trim()) newErrors.car_brand = 'Brand required';
        if (!formData.car_model.trim()) newErrors.car_model = 'Model required';
        if (!formData.car_year.trim()) newErrors.car_year = 'Year required';
        if (!formData.car_reg.trim()) newErrors.car_reg = 'Reg required';
        if (!formData.owner_email.trim()) {
            newErrors.owner_email = 'Email required';
        } else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
            newErrors.owner_email = 'Invalid email';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function formatName(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function formatReg(str) {
        return str.trim().toUpperCase();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        if (!validateForm()) {
            setSubmitMessage('Please correct the errors.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Format registration
            const car_reg = formatReg(formData.car_reg);
            // Format brand and model
            const car_brand = formatName(formData.car_brand.trim());
            const car_model = formatName(formData.car_model.trim());
            // Convert year to YYYY-01-01 format
            const year = formData.car_year.trim();
            const car_year = /^\d{4}$/.test(year) ? `${year}-01-01` : year;
            const cleanData = { 
                ...formData, 
                car_reg,
                car_brand,
                car_model,
                car_year,
                owner_email: formData.owner_email.toLowerCase() 
            };
            // 1. Add car
            const carRes = await axios.post(`${baseUrl}/cars`, cleanData);
            const car_id = carRes.data.car_id;
            // 2. Link car to show
            if (car_id && show_ground_id) {
                await axios.post(`${baseUrl}/car_at_show`, { car_id, show_ground_id });
            }
            setSubmitMessage('Car added and linked to show!');
            setFormData({
                car_brand: '',
                car_model: '',
                car_year: '',
                car_reg: '',
                owner_email: ''
            });
            setTimeout(() => {
                navigate(location.state?.from || "/", { replace: true });
            }, 1000);
        } catch (err) {
            setSubmitMessage(
                err.response?.data?.error || 'Failed to add car. Please try again.'
            );
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.heading}>Car Registration</h2>

            <div className={styles.formGroup}>
                <label className={styles.label}>Brand:</label>
                <input
                    className={styles.input}
                    type="text"
                    name="car_brand"
                    value={formData.car_brand}
                    onChange={handleChange}
                />
                {errors.car_brand && <span className={styles.error}>{errors.car_brand}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Model:</label>
                <input
                    className={styles.input}
                    type="text"
                    name="car_model"
                    value={formData.car_model}
                    onChange={handleChange}
                />
                {errors.car_model && <span className={styles.error}>{errors.car_model}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Car Year:</label>
                <input
                    className={styles.input}
                    type="text"
                    name="car_year"
                    value={formData.car_year}
                    onChange={handleChange}
                />
                {errors.car_year && <span className={styles.error}>{errors.car_year}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Registration:</label>
                <input
                    className={styles.input}
                    type="text"
                    name="car_reg"
                    value={formData.car_reg}
                    onChange={handleChange}
                />
                {errors.car_reg && <span className={styles.error}>{errors.car_reg}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Email:</label>
                <input
                    className={styles.input}
                    type="email"
                    name="owner_email"
                    value={formData.owner_email}
                    onChange={handleChange}
                />
                {errors.owner_email && <span className={styles.error}>{errors.owner_email}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.button}>
                {isSubmitting ? 'Registering...' : 'Register'}
            </button>

            <button
                type="button"
                className={`${styles.button} ${styles.backButton}`}
                onClick={() => navigate(location.state?.from || "/", { replace: true })}
            >
                Back
            </button>

            {submitMessage && <div className={styles.submitMessage}>{submitMessage}</div>}
        </form>

    );
}

export default AddCar;