import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Room from './components/Room'

const App = () => {
  
  return (
    <div className="bg-black h-screen w-screen">  
      
      <Routes>
        <Route path="/" element={<Room/>}/>
        {/* <Route path="/chat" element={ChatBox}/> */}
        {/* <Route/> */}
  
      </Routes>
    </div>
    )
}




export default App