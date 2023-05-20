import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import HomePage from './pages/Home';
import Test from './pages/Test'
import Plan from './pages/Plan'

import { ChakraProvider } from '@chakra-ui/react'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<Test/>} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
  </Router>
  </ChakraProvider>
);
