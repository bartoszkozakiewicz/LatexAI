import { useState } from 'react'
import Split from 'react-split';
import './App.css'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

function App() {
  const [allCode, setAllCode] = useState([])

  const [sidebarWidth, setSidebarWidth] = useState('');

  return (
    <>
      <Navbar />
      <div className='main-container'>
        <Split
           sizes={[30, 70]}
           direction="horizontal"
           className="split"
        >
          <Sidebar sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth}/>
          <Editor />
        </Split>
      </div>
    </>
  )
}

export default App
