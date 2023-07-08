import React from "react"
import {AiFillFileAdd} from 'react-icons/ai'
import {AiFillDelete} from 'react-icons/ai'
import {MdDriveFileRenameOutline} from 'react-icons/md'

export default function Sidebar(props){
 
    //Function essential to change filenames
    function handleEdit(id){
        props.setAllCode(prevAllCode=>prevAllCode.map(code=>id===code.id?({...code,isEdit:!code.isEdit}):code))
    }

    //Function to change filename
    function handleChange(event,id){
        props.setAllCode(prevAllCode=>prevAllCode.map(code=>id===code.id?({...code,name:event.target.value}):code))        
    }

    const files = props.allCode.map((code,idx)=>(
        <div key={code.id} className={code.id===props.currentCode.id ? "file-selected" : "file"} onClick={()=>props.setCurrentCodeId(code.id)}>
            <div className="one-file">

                {code.isEdit? 
                    <input style={{marginRight:'auto'}} className="edit-input"
                    type="text" 
                    onChange={(event)=>handleChange(event,code.id)}
                    value={code.name}
                />
                :<p style={{marginRight:'auto'}} >{code.name}</p>
                }

                <MdDriveFileRenameOutline onClick={()=>handleEdit(code.id)} style={{marginRight:'5px'}}/>
                <AiFillDelete onClick={()=>props.deleteCode(code.id)}/>
            </div>
        </div>
    ))
    return(
        <div className="sidebar" >
            <nav className="sidebar-nav">
                <p style={{ marginRight: '10px', fontWeight:500 }}>Add files</p>
                <AiFillFileAdd onClick={props.createNewCode} className="add-icon"/>
            </nav>
            {files}
        </div>
        
    )
}