import React, { useState } from 'react';
import styles from './AddUsers.module.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function AddUser({ baseUrl }) {
    const [formData, setFormData] = useState({
        owner_first_name: '',
        owner_last_name: '',
        owner_email: '',
        owner_phone: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Get the previous page from state or fallback to "/"
    const from = location.state?.from || "/";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.owner_first_name.trim()) newErrors.owner_first_name = 'First name required';
        if (!formData.owner_last_name.trim()) newErrors.owner_last_name = 'Last name required';
        if (!formData.owner_email.trim()) {
            newErrors.owner_email = 'Email required';
        } else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
            newErrors.owner_email = 'Invalid email';
        }
        if (!formData.owner_phone.trim()) newErrors.owner_phone = 'Phone required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function formatName(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
            const cleanData = {
                ...formData,
                owner_first_name: formatName(formData.owner_first_name.trim()),
                owner_last_name: formatName(formData.owner_last_name.trim()),
                owner_email: formData.owner_email.toLowerCase()
            };
            await axios.post(`${baseUrl}/owners`, cleanData);
            setSubmitMessage('Registration successful!');
            setFormData({
                owner_first_name: '',
                owner_last_name: '',
                owner_email: '',
                owner_phone: ''
            });
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000); // Show success message for 1 second
        } catch (err) {
            setSubmitMessage(
                err.response?.data?.error || 'Registration failed. Please try again.'
            );
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
    <h2 className={styles.heading}>User Registration</h2>

    <div className={styles.formGroup}>
        <label className={styles.label}>First Name</label>
        <input
            className={styles.input}
            type="text"
            name="owner_first_name"
            value={formData.owner_first_name}
            onChange={handleChange}
        />
        {errors.owner_first_name && (
            <span className={styles.error}>{errors.owner_first_name}</span>
        )}
    </div>

    <div className={styles.formGroup}>
        <label className={styles.label}>Last Name</label>
        <input
            className={styles.input}
            type="text"
            name="owner_last_name"
            value={formData.owner_last_name}
            onChange={handleChange}
        />
        {errors.owner_last_name && (
            <span className={styles.error}>{errors.owner_last_name}</span>
        )}
    </div>

    <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
            className={styles.input}
            type="email"
            name="owner_email"
            value={formData.owner_email}
            onChange={handleChange}
        />
        {errors.owner_email && (
            <span className={styles.error}>{errors.owner_email}</span>
        )}
    </div>

    <div className={styles.formGroup}>
        <label className={styles.label}>Phone</label>
        <input
            className={styles.input}
            type="text"
            name="owner_phone"
            value={formData.owner_phone}
            onChange={handleChange}
        />
        {errors.owner_phone && (
            <span className={styles.error}>{errors.owner_phone}</span>
        )}
    </div>

    <button
        type="submit"
        className={styles.button}
        disabled={isSubmitting}
    >
        {isSubmitting ? 'Registering...' : 'Register'}
    </button>

    {submitMessage && (
        <div className={styles.submitMessage}>{submitMessage}</div>
    )}
</form>

    );
}

export default AddUser;