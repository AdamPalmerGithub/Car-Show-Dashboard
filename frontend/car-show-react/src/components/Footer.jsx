import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <h2 className={styles.emailText}>
                If you want to add your own car show, email: CarShow@email.com
            </h2>
            <h4 className={styles.copyText}>©2025 AdamIsAmazing Inc.</h4>
        </footer>
    );
};

export default Footer;
