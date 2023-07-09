import { useState } from 'react'
import React from "react"
import Split from 'react-split';
// import SplitPane, { Pane } from 'split-pane-react';
// import 'split-pane-react/esm/themes/default.css'
import './App.css'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Review from './components/Review'
import Navbar from './components/Navbar'
import {nanoid} from "nanoid"
import axios from 'axios';


function App() {
  const [allFolders, setAllFolders] = useState([]) //In case of folders creating
  const [allCode, setAllCode] = useState([])
  const [currentCodeId, setCurrentCodeId] = useState(allCode[0] && allCode[0].id || '')
  const [review, setReview] = React.useState(false)


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
    console.log(currentCode.code)
  }

  //end



  //Function to find current code
  const currentCode = allCode.find(code=> code.id === currentCodeId) || 0

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

  //Function to propose autocompletion:
  async function proposeChanges(){
    // Add post here
    console.log("propozycja")
    try {
      const response = await axios.post('/api/autocomplete',  { latexText: currentCode.code });
      const fileURL = response.data.fileURL;
      console.log('PDF generated successfully:', fileURL);
      // Wyświetl link do pobrania wygenerowanego pliku PDF
    } catch (error) {
      console.error('Error generating PDF:', error);
    }

  }
  React.useEffect(()=>{
    const timeoutId = setTimeout(()=> {
      proposeChanges()
    }, 1000)
    return ()=>clearTimeout(timeoutId)
  },[currentCode.code])


  return (
    <>
      <Navbar />
      <div className='main-container'>
        {review? 
        
          <Split
          sizes={[20,80]}
          direction="horizontal"
          className="split"
          >
              <Sidebar 
                //functions
                createNewCode={createNewCode}
                deleteCode={deleteCode}
                currentCode={currentCode}
                updateName={updateName}

                //States
                allCode={allCode}
                setAllCode={setAllCode}
                setCurrentCodeId={setCurrentCodeId}
              />

              <Split
              sizes={[60,40]}
              direction="horizontal"
              className="split">
                <Editor 
                  updateCode={updateCode}
                  currentCode={currentCode}
                  setReview={setReview}
                  review={review}
                />
                <Review/>
              </Split>

          </Split>

        : 
          <Split
            sizes={[20, 80]}
            direction="horizontal"
            className="split"
          >
            <Sidebar 
              //functions
              createNewCode={createNewCode}
              deleteCode={deleteCode}
              currentCode={currentCode}
              updateName={updateName}

              //States
              allCode={allCode}
              setAllCode={setAllCode}
              setCurrentCodeId={setCurrentCodeId}
            />
            <Editor 
              updateCode={updateCode}
              currentCode={currentCode}
              setReview={setReview}
              review={review}
            />
          </Split>
        }
      </div>
    </>
  )
}

export default App
