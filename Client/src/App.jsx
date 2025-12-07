import './App.css'
import Navbar from './components/Navbar'
import Hero from './pages/Hero'
import Features from './pages/Features'
import Steps from './pages/Steps'
import Showcase from './pages/Showcase'
import Testimonials from './pages/Testimonials'
import ChooseUs from './pages/ChooseUs'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import { useState ,useEffect } from 'react'

import AppLoader from './components/AppLoader'

function App() {
  const [appReady , setAppReady ] = useState(false);

  useEffect(()=>{
    setTimeout(()=>{
      setAppReady(true);
    },1500);
  },[]);

  return (
    <>
      {!appReady && <AppLoader />}
      {appReady && (
        <div>
        <Navbar />
        <Hero />
        <Features />
        <Steps />
        <Showcase />
        <Testimonials />
        <ChooseUs />
        <Contact />
        <Footer />
      </div>
      )}
      
    </>
  )
}

export default App
