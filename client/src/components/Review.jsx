import React from 'react'

export default function Review(props){

    return(
        <div className="review-container">
            <p style={{fontWeight: "600", fontSize:'20px', marginTop:'30px'}}>REVIEW</p>
            <div className="review-content">Content from AI
                {props.reviewContent}
            </div>
        </div>
    )
}