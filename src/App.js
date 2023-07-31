import { useRef, useEffect } from 'react'

import * as faceapi from 'face-api.js'
import * as canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

function App() {
  const videoRef = useRef()
  const canvasRef = useRef()

  useEffect(() => {
    startVideo()
    videoRef && loadModels()

  }, [])

  //캠켜기
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((currentStream) => {
      videoRef.current.srcObject = currentStream
    })
      .catch((err) => {
        console.log(err)
      })
  }

  //faceapi
  const loadModels = () => {
    Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
      faceapi.nets.mtcnn.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.tinyYolov2.loadFromUri('/models')
    
    ]).then(() => {
      faceMyDetect()
    })
  }

  const faceMyDetect = () => {
    setInterval(async () => {
      const detectionWithExpressions = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceExpressions()
      console.log(detectionWithExpressions);


    },1000)
  }

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvide">

        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} width="940" height="650"
        className="appcanvas" />
    </div>
  )
}

export default App;