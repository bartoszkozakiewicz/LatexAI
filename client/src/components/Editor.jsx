import React from 'react'
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-github';
import axios from 'axios';


export default function Editor(){

    const [text, setText] = React.useState('')

    function handleChange(newText){
        setText(newText)
        console.log(text)
    }

    async function generatePDF(){
        try {
            const response = await axios.post('/api/compile',  { latexText: text });
            const fileURL = response.data.fileURL;
            console.log('PDF generated successfully:', fileURL);
            // Wyświetl link do pobrania wygenerowanego pliku PDF
          } catch (error) {
            console.error('Error generating PDF:', error);
          }
        };
    

    return (
        <div className='editor'>
            <nav className="editor-nav">
                <p className='nav-title'>Editor</p>
                <button className='nav-button'>Review</button>
                <button className='nav-button' onClick={generatePDF}>Compile</button>
            </nav>
            <AceEditor 
                className="latexEditor"
                mode="latex"
                value={text}
                name="latex-editor"
                onChange={handleChange}
                editorProps={{
                    $blockScrolling: true, 
                }}
                style={{width: '100%',  height: '90%' }}
            />
        </div>
    )
}

