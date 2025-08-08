import React, { useState } from "react";
import styles from './DeleteCarFromShow.module.css';


function DeleteCar({ carId, showGroundId, onDeleted, baseUrl }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleDelete = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${baseUrl}/remove_car_from_show`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ car_id: carId, show_ground_id: showGroundId, owner_email: email })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Car removed from this show!");
                if (onDeleted) onDeleted();
            } else {
                setError(data.error || "Remove failed");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    return (
        <form onSubmit={handleDelete} className={styles.form}>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
            />
            <button type="submit" className={styles.button}>
                Remove from Show
            </button>
            {error && <span className={`${styles.message} ${styles.error}`}>{error}</span>}
            {success && <span className={`${styles.message} ${styles.success}`}>{success}</span>}
        </form>
    );
}

export default DeleteCar;