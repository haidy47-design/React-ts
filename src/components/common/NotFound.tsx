import React from 'react'
import image from '../../assets/NotFound.png'




export default function NotFound(): React.ReactElement {
  return (
    <>
      <div className="vh-100">
        <div className="container d-flex flex-column justify-content-center align-items-center h-100">
          <img src={image} className='rounded-circle' alt="Not Found" style={{maxWidth: 700 }} />
        </div>
      </div>
    </>
  )
}





