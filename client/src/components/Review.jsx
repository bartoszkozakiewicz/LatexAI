import React from 'react'

export default function Review(){

    return(
        <div className="review-container">
            <p style={{fontWeight: "600", fontSize:'20px', marginTop:'30px'}}>REVIEW</p>
            <div className="review-content">Content from AI
                <ul className="review-points">
                    <li>Linia 12: ...</li>
                    <li>Linia 20: ...</li>
                </ul>
            </div>
        </div>
    )
}