import React from 'react'
import { PacmanLoader } from 'react-spinners';


export default function Review(props){

    return(
        <div className="review-container">
            <p style={{fontWeight: "600", fontSize:'20px', marginTop:'30px'}}>REVIEW</p>
            <div className="review-content">
                {props.loading? 
                <div className="loading-panel">
                    <PacmanLoader color="#0087FF" size={40} />
                </div>
                : props.reviewContent
                }

            </div>
        </div>
    )
}