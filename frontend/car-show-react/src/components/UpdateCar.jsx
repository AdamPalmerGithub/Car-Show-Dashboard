import React, { useState } from "react";
import axios from 'axios';

function UpdateCar({ car, baseUrl, onUpdated }) {
    const [formData, setFormData] = useState({
        car_brand: car.car_brand,
        car_model: car.car_model,
        car_year: car.car_year ? new Date(car.car_year).getFullYear() : '',
        car_reg: car.car_reg,
        owner_email: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function formatName(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    function formatReg(str) {
        return str.trim().toUpperCase();
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const payload = {
                car_id: car.car_id,
                owner_email: formData.owner_email.toLowerCase(),
                car_brand: formatName(formData.car_brand),
                car_model: formatName(formData.car_model),
                car_year: /^\d{4}$/.test(formData.car_year) ? `${formData.car_year}-01-01` : formData.car_year,
                car_reg: formatReg(formData.car_reg)
            };
            const res = await axios.put(`${baseUrl}/update_car`, payload);
            if (res.status === 200) {
                setSuccess("Car updated!");
                setShowForm(false);
                if (onUpdated) onUpdated();
            } else {
                setError(res.data.error || "Update failed");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
        }
    };

    return (
        <>
            <button onClick={() => setShowForm(f => !f)} style={{ marginRight: "0.5rem" }}>
                Update
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} style={{ display: "inline-block", marginTop: "0.5rem" }}>
                    <input
                        type="text"
                        name="car_brand"
                        value={formData.car_brand}
                        onChange={handleChange}
                        placeholder="Brand"
                        required
                        style={{ marginRight: "0.5rem" }}
                    />
                    <input
                        type="text"
                        name="car_model"
                        value={formData.car_model}
                        onChange={handleChange}
                        placeholder="Model"
                        required
                        style={{ marginRight: "0.5rem" }}
                    />
                    <input
                        type="text"
                        name="car_year"
                        value={formData.car_year}
                        onChange={handleChange}
                        placeholder="Year"
                        required
                        style={{ width: "5rem", marginRight: "0.5rem" }}
                    />
                    <input
                        type="text"
                        name="car_reg"
                        value={formData.car_reg}
                        onChange={handleChange}
                        placeholder="Registration"
                        required
                        style={{ marginRight: "0.5rem" }}
                    />
                    <input
                        type="email"
                        name="owner_email"
                        value={formData.owner_email}
                        onChange={handleChange}
                        placeholder="Your email"
                        required
                        style={{ marginRight: "0.5rem" }}
                    />
                    <button type="submit">Save</button>
                    {error && <span style={{ color: "red", marginLeft: "0.5rem" }}>{error}</span>}
                    {success && <span style={{ color: "green", marginLeft: "0.5rem" }}>{success}</span>}
                </form>
            )}
        </>
    );
}

export default UpdateCar;