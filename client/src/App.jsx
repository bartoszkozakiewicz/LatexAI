import { useState } from 'react'
import React from "react"
import Split from 'react-split';
import './App.css'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Review from './components/Review'
import Navbar from './components/Navbar'
import {nanoid} from "nanoid"



function App() {
  const [allCode, setAllCode] = useState([
    {
      id: nanoid(), 
      code: "\\documentclass{article} \n\n \\end{document}",
      name: "example code 1",
      isEdit:false
    },
    {
      id: nanoid(), 
      code: "\\documentclass{article} \n\n \\end{document}",
      name: "example code 2",
      isEdit:false
    }
  ])
  const [currentCodeId, setCurrentCodeId] = useState(allCode[0] && allCode[0].id || '')
  const [review, setReview] = React.useState(false)
  const [reviewContent, setReviewContent] = React.useState([])
  const [loading, setLoading] =React.useState(false) //review loading
  const [displayBibliography,setDisplayBibliography] = React.useState(false)//displaying bibliography


  //autocomplete
  const [display,setDisplay] = useState(false)//display autocomplete propose?
  const [options,setOptions] = useState([]) //given options


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

  //Hide proposals after user starts to write
  React.useEffect(()=>{
    setDisplay(false)
  },[currentCode.code])

  return (
    <>
      <Navbar />
      <div className='main-container'>
        {review? 
        
          <Split
          // sizes={[20,80]}
          minSize={[150,1000]}
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
              // sizes={[60,40]}
              minSize={[500,200]}
              direction="horizontal"
              className="split">
                <Editor 
                  allCode={allCode}
                  setAllCode={setAllCode}
                  updateCode={updateCode}
                  currentCode={currentCode}
                  currentCodeId={currentCodeId}
                  setReview={setReview}
                  review={review}
                  display={display}
                  setDisplay={setDisplay}
                  options={options}
                  setOptions={setOptions}
                  reviewContent={reviewContent}
                  setReviewContent={setReviewContent}
                  setLoading={setLoading}
                  setDisplayBibliography={setDisplayBibliography}
                  displayBibliography = {displayBibliography}
                />
              <Review reviewContent={reviewContent.map(elem => {
                    return (
                        <span>{elem}<br></br><br></br></span>
                    )
                  })} loading={loading}/>
              </Split>

          </Split>
        

        : 
          <Split
            sizes={[20, 80]}
            minSize={[150,500]}
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
              allCode={allCode}
              setAllCode={setAllCode}
              updateCode={updateCode}
              currentCode={currentCode}
              currentCodeId={currentCodeId}
              setReview={setReview}
              reviewContent={reviewContent}
              setReviewContent={setReviewContent}
              review={review}
              display={display}
              setDisplay={setDisplay}
              options={options}
              setOptions={setOptions}
              setLoading={setLoading}
              setDisplayBibliography={setDisplayBibliography}
              displayBibliography = {displayBibliography}
            />
          </Split>
        }
      </div>
    </>
  )
}

export default App
