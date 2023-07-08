import { useState } from 'react'
import React from "react"
import Split from 'react-split';
import './App.css'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import {nanoid} from "nanoid"

function App() {
  const [allFolders, setAllFolders] = useState([]) //In case of folders creating
  const [allCode, setAllCode] = useState([])
  const [currentCodeId, setCurrentCodeId] = useState(allCode[0] && allCode[0].id || '')


  //Function to append new Latex code
  function createNewCode(){
    const newCode = {
      id: nanoid(), //unique ID for each latex code
      code: "",
      name: "code",
      isEdit:false
    }
    setAllCode(prevAllCode=>[newCode,...prevAllCode])
    setCurrentCodeId(newCode.id)
  }
  React.useEffect(()=>{
    localStorage.setItem("notes", JSON.stringify(allCode))
  },[allCode])

  //end


  //Function to update code - also getting the newest file on the top
  function updateCode(code){
    const newCode=[]
    allCode.forEach(prevCode=>{
      if (prevCode.id === currentCodeId){
        newCode.unshift({...prevCode, code:code})
      }else{
        newCode.push(prevCode)
      }
    })
    setAllCode(newCode)
    console.log(allCode)
  }

  //end



  //Function to find current code
  function findCurrentCode(){
    return allCode.find(code=>{
      return code.id === currentCodeId
    }) || 0
  }

  //end

  //Function to delete code
  function deleteCode(codeId){
    setAllCode(prevAllCode=>prevAllCode.filter(code=>code.id!==codeId))
  }

  //end

  //Change filename
  function updateName(codeId, codeName) {
    setAllCode(prevAllCode =>
      prevAllCode.map(code => {
        if (code.id !== codeId) {
          return code;
        } else {
          return { ...code, name: codeName };
        }
      })
    );
  }
  
  
  //end

  return (
    <>
      <Navbar 
      />
      <div className='main-container'>
        <Split
           sizes={[30, 70]}
           direction="horizontal"
           className="split"
        >

          <Sidebar 
            //functions
            createNewCode={createNewCode}
            deleteCode={deleteCode}
            currentCode={findCurrentCode()}
            updateName={updateName}

            //States
            allCode={allCode}
            setAllCode={setAllCode}
            setCurrentCodeId={setCurrentCodeId}
          />
          <Editor 
            updateCode={updateCode}
            currentCode={findCurrentCode()}
          />

        </Split>
      </div>
    </>
  )
}

export default App
