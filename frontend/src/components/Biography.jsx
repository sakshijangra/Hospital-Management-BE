import React from 'react'

const Biography = ({imageUrl}) => {
  return (
    <div className = "container biography">
        <div className="banner">
            <img src={imageUrl}></img>
        </div>
        <div className='banner'>
            <p>Biography</p>
            <h3>Who we are</h3>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corporis fuga inventore error iusto sequi alias aliquid laborum illo eaque tempore adipisci id soluta debitis ut, blanditiis eius nulla quisquam vel quaerat consequatur ipsum aut pariatur odit distinctio. Nobis veritatis quae sapiente soluta, aliquam iure optio mollitia provident architecto, quos voluptatibus!</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit.</p>
            <p>Lorem ipsum dolor sit amet.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Autem, nemo! Neque fugiat ut aut quaerat soluta quas temporibus suscipit, nihil culpa. Exercitationem ipsa quidem, molestias obcaecati accusantium ratione. In quae sed beatae neque exercitationem eius!</p>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Earum ad expedita necessitatibus.</p>
            <p>Lorem, ipsum dolor.</p>
        </div>
    </div>
  )
}

export default Biography