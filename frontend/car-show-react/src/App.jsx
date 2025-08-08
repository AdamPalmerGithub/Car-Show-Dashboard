// import './AddUser.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Header from './components/Header';
import Footer from './components/Footer';
import ShowList from './components/ShowList';
import ShowItem from './components/ShowItem';
import AddUser from './components/AddUsers';
import AddCar from './components/AddCar';

const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  return (
    <div>
    <Router>
      <div id="root">
        <Header />
        <div className="main-content">
          <main style={{ flex: 1, padding: "2rem" }}>
            <Routes>
              <Route path="/" element={<ShowList baseUrl={API_BASE_URL} />} />
              <Route path="/show/:id" element={<ShowItem baseUrl={API_BASE_URL} />} />
              <Route path="/register" element={<AddUser baseUrl={API_BASE_URL} />} />
              <Route path="/addcar" element={<AddCar baseUrl={API_BASE_URL} />} />
            </Routes>
          </main>
        </div>
        
      </div>
    </Router>
    <Footer />
    </div>
    
  );
}

export default App
