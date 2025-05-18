import React from 'react'

const Hero = ({title, imageUrl}) => {
  return (
    <div className= "hero container">
        <div className = "banner">
            <h1>{title}</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero ipsum voluptates quo cupiditate architecto aut eum cumque eius sit. Blanditiis enim perferendis est dolore omnis sapiente minima sint vel veritatis?</p>
        </div>
        <div className = "banner">
            <img src={imageUrl} alt = "Hero" className = "animated-image"></img>
            <span>
                <img src = '/Vector.png' alt = 'vector'></img>
            </span>
        </div>
    </div>
  )
}

export default Hero