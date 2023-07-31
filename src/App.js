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
    const displaySize = { width: videoRef.current.width, height: videoRef.current.height }

    // 입력 차원에 맞게 오버레이 캔버스의 크기 조정
    const canvas = canvasRef.current;
    faceapi.matchDimensions(canvas, displaySize);

    const detectionsWithExpressions = await faceapi
      .detectAllFaces(videoRef.current)
      .withFaceLandmarks()
      .withFaceExpressions();
    console.log(detectionsWithExpressions);

    // 표시된 이미지와 원본 이미지의 크기가 다를 경우 감지된 상자와 랜드마크 크기 조정
    const resizedResults = faceapi.resizeResults(detectionsWithExpressions, displaySize);
    // 캔버스에 감지 결과 그리기
    faceapi.draw.drawDetections(canvas, resizedResults);
    // 최소 확률로 얼굴 표현을 나타내는 텍스트 상자 그리기
    const minProbability = 0.05;
    faceapi.draw.drawFaceExpressions(canvas, resizedResults, minProbability);
  }, 1000);
};

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