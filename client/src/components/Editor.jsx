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

    function generateReview(){
        props.setReview(prevReview=>!prevReview)
        console.log(props.review)
    }

    React.useEffect(() => {
        const editor = overlayRef.current.editor;
    
        const handleCursorPosition = (e) => {
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
                <button className='nav-button' onClick={generateReview}>{props.review ? "Hide Review" : "Review"}</button>
                <button className='nav-button' onClick={generatePDF}>Compile</button>
            </nav>
            <AceEditor 
                ref={overlayRef}
                className="latexEditor"
                mode="latex"
                value={props.currentCode.code}
                name="latex-editor"
                onChange={props.updateCode}
                editorProps={{
                    $blockScrolling: true, 
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

