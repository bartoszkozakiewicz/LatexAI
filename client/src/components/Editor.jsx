import React from 'react'
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-github';
import axios from 'axios';


export default function Editor(props){

    const overlayRef = React.useRef(null);
    const [cursorPos, setCursorPos] = React.useState({ x: 10, y: 0.0 });

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
    
          //Function to propose autocompletion:
    async function proposeChanges(){



        const editor = overlayRef.current.editor;
        const cursorPosition = editor.getCursorPosition();
        const index = editor.session.getDocument().positionToIndex(cursorPosition, 0);

        console.log("index",index);    
        const textToSend = props.currentCode.code.substring(0,index)+"XXX"+props.currentCode.code.substring(index)
        console.log(textToSend) 

        // Add post here
        console.log("propozycja")
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
    React.useEffect(()=>{
        const timeoutId = setTimeout(()=> {
          proposeChanges()
        }, 1000)
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
        // const newCode = props.allCode.map(prevCode => {
        //   if (prevCode.id === props.currentCodeId) {
        //     return { ...prevCode, code: prevCode.code + code };
        //   }
        //   return prevCode;
        // });

        props.setDisplay(false)
        //await props.setAllCode(props.allCode)
        // editor.navigateFileEnd()
        console.log(props.allCode)
        editor.focus()
      }
    async function generateBibliography(){
      console.log("Bibliografia")
      try {
        const response = await axios.post('/api/bibliography', {latexText: props.currentCode.code})
        console.log(response.data[0])
      }
      catch(error){
        console.error('Searching for bibliography:',error)
      }
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
                <button className='nav-button' onClick={generateBibliography}>generateBibliography</button>

                <button className='nav-button' onClick={generateReview}>{props.review ? "Hide Review" : "Review"}</button>
                <button className='nav-button' onClick={generatePDF}>Compile</button>
            </nav>
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
                style={{width: '100%',  height: '90%' }}
            />
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

