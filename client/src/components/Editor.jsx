import React from 'react'
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-github';
import axios from 'axios';
import {nanoid} from "nanoid"


export default function Editor(props){

    const overlayRef = React.useRef(null);
    const [cursorPos, setCursorPos] = React.useState({ x: 10, y: 0.0 });
    const [bibliography,setBibliography] = React.useState("")
    const [citation,setCitation] = React.useState("")
    const [doi,setDoi] = React.useState("")
 

    async function generatePDF(){
        try {
            const response = await axios.post('/api/compile',  { latexText: props.currentCode.code });
            const fileURL = response.data.fileURL;
            console.log('PDF generated successfully:', fileURL);
            // Wyświetl link do pobrania wygenerowanego pliku PDF
          } catch (error) {
            console.error('Error generating PDF:', error);
          }
        };

    async function generateReview(){
        props.setLoading(false)
        props.setReview(prevReview=>!prevReview)
        console.log(props.review)
        if (!props.review) {
            try {
                // props.currentCode.code is the currently active (visible) code
                const response = await axios.post('/api/review',  { latexText: props.currentCode.code });
                const fileURL = response.data.review;
                props.setReviewContent(response.data.final_response)
                console.log('Review generated successfully:', fileURL);
                props.setLoading(true)
                // Wyświetl link do pobrania wygenerowanego pliku PDF
            } catch (error) {
                console.error('Review generating PDF:', error);
            }
        }
        };

        async function generateBibliography(){
          console.log("Bibliografia")
          const editor = overlayRef.current.editor;
          const cursorPosition = editor.getCursorPosition();
          const index = editor.session.getDocument().positionToIndex(cursorPosition, 0);

          const textToSend = props.currentCode.code.substring(0,index)
          console.log(textToSend)
          // setBibliography(textToSend)
          props.setDisplayBibliography(prevBiblio=>!prevBiblio)

          try {
            const response = await axios.post('/api/bibliography', {latexText: textToSend})
            console.log(response.data)
            if (response.data.summary === null) {
              setBibliography("Matching bibliography was not found")
            }
            else {
              setBibliography(response.data.summary)
              setCitation(response.data.citation)
              setDoi(response.data.doi)
            }
              
          }
          catch(error){
            console.error('Searching for bibliography:',error)
          }
          
          }

          function addBibliography() {
            const editor = overlayRef.current.editor;
            const cursorPosition = editor.getCursorPosition();
            const index = editor.session.getDocument().positionToIndex(cursorPosition, 0);
            const textToSend = props.currentCode.code.substring(0,index)+` \\cite{${doi}} `+props.currentCode.code.substring(index)
            props.setAllCode(prevAllCode => 
              prevAllCode.map(ele =>
                ele.id === props.currentCode.id
                ? {
                  ...ele,
                  code: textToSend
                }: ele
              )
            );

            if (props.allCode.some(code => code.name === "bibliography")) {
              props.setAllCode(prevAllCode =>
                prevAllCode.map(ele =>
                  ele.name === "bibliography"
                    ? {
                        ...ele,
                        code: ele.code +"\n\n" + citation
                      }
                    : ele
                )
              );
            } else {
              props.setAllCode(prevAllCode => [
                ...prevAllCode,
                {
                  id: nanoid(),
                  code: citation, // {bibliography}
                  name: "bibliography",
                  isEdit: false
                }
              ]);
            }
            ignoreBibliography()
          }
          
        function ignoreBibliography(){
          setBibliography("")
          props.setDisplayBibliography(prevBiblio=>!prevBiblio)
        }


          //Function to propose autocompletion:
    async function proposeChanges(){

        const editor = overlayRef.current.editor;
        const cursorPosition = editor.getCursorPosition();
        const index = editor.session.getDocument().positionToIndex(cursorPosition, 0);


        if(props.currentCode){  
        const textToSend = props.currentCode?.code?.substring(0,index)+"XXX"+props.currentCode.code.substring(index)
        console.log(textToSend) 
 

        // Add post here
        try {
        const response = await axios.post('/api/autocomplete',  { latexText: textToSend});
        const fileURL = response.data.fileURL;
        console.log('PDF generated successfully:', fileURL);
        props.setOptions([response.data.final_response])
        props.currentCode.code ? 
        props.setDisplay(true):
        props.setDisplay(false)

        // Wyświetl link do pobrania wygenerowanego pliku PDF
        } catch (error) {
        console.error('Error generating PDF:', error);
        }
      }
    }
    React.useEffect(()=>{
        const timeoutId = setTimeout(()=> {
          proposeChanges()
        }, 100)
        return ()=>clearTimeout(timeoutId)
      },[props.currentCode.code])
        
        

    React.useEffect(() => {
        const editor = overlayRef.current.editor;
    
        const handleCursorPosition = (e) => {
          props.setDisplay(false)
          const cursorPosition = editor.getCursorPosition();
          const cursorCoords = editor.renderer.textToScreenCoordinates(cursorPosition.row, cursorPosition.column);
          setCursorPos({x:cursorCoords.pageX,y:cursorCoords.pageY})
        };
    
        editor.selection.on('changeCursor', handleCursorPosition);
        editor.renderer.on('afterRender', handleCursorPosition);
    
        return () => {
          editor.selection.off('changeCursor', handleCursorPosition);
          editor.renderer.off('afterRender', handleCursorPosition);
        };
      }, []);

          //Function to autocomplete code
    async function autoCompleteCode(code){
        const editor = overlayRef.current.editor;
        const currentPosition = editor.getCursorPosition();
        await editor.session.insert(currentPosition, code);
        console.log(currentPosition)

        props.setDisplay(false)
        console.log(props.allCode)
        editor.focus()
      }

    //end

      //Dynamic position
      const styles={
        position: 'fixed',
        top: cursorPos.y,
        left: cursorPos.x,
        marginLeft:'3px'
      }

    return (
        <div className='editor'>
            <nav className="editor-nav">
                <p className='nav-title'>Editor</p>
                <button className='nav-button' onClick={generateBibliography}>Bibliography</button>
                <button className='nav-button' onClick={generateReview}>{props.review ? "Hide Review" : "Review"}</button>
                <button className='nav-button' onClick={generatePDF}>Compile</button>
            </nav>
            <div className="edit-biblio-container">
              <AceEditor 
                  ref={overlayRef}
                  className="latexEditor"
                  mode="latex"
                  value={props.currentCode.code}
                  name="latex-editor"
                  wrap={true}

                  onChange={props.updateCode}
                  wrapEnabled={true} // Włącz zawijanie tekstu
                  editorProps={{
                      $blockScrolling: Infinity,
                    }}
                  style={{width: '100%',  height: '100%' }}
              />
              {props.displayBibliography?
              <div className="biblio-container">
                <div className="bibliography" style={{position:'absolute'}}>
                  <p className="abstract" >ABSTRACT</p>
                  Training generative adversarial networks (GAN) using too little data typically leads
                  to discriminator overfitting, causing training to diverge. We propose an adaptive
                  discriminator augmentation mechanism that significantly stabilizes training in
                  limited data regimes. The approach does not require changes to loss functions
                  or network architectures, and is applicable both when training from scratch and
                  when fine-tuning an existing GAN on another dataset. We demonstrate, on several
                  datasets, that good results are now possible using only a few thousand training
                  images, often matching StyleGAN2 results with an order of magnitude fewer
                  images. We expect this to open up new application domains for GANs. We also
                  find that the widely used CIFAR-10 is, in fact, a limited data benchmark, and
improve the record FID from 5.59 to 2.42.</div> {/* {bibliography} */}
                <div className="biblio-buttons">
                  <button className='nav-button' onClick={addBibliography}>Add</button>
                  <button className='nav-button' onClick={ignoreBibliography}>Ignore</button>
                </div>
              </div>

              :null
              }

            </div>

            {props.display && (
                <div style={styles}>
                    {props.options.map((val,idx)=>{
                        return (
                            <div 
                                onClick={()=>autoCompleteCode(val)}
                                className="option"
                                key={idx}
                                tabIndex="0"
                            >
                                <span>{val}</span>
                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}

