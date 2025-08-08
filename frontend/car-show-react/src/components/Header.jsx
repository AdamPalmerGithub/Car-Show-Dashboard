import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

function Header() {
    return (
        <header className={styles.header}>
            <Link to="/" className={styles.mainMenuBtn}>Main Menu</Link>

            <div className={styles.headerContent}>
                <h1>Welcome</h1>
                <h2>Check out the car shows</h2>
            </div>

            <Link to="/register" className={styles.userRegBtn}>User Register</Link>
        </header>   
    );
}

export default Header;
