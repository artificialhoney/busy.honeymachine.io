import '@tensorflow/tfjs-backend-webgl'
import './style.css'

import * as blazeface from '@tensorflow-models/blazeface'

import bigote1 from '../assets/bigotes/bigote1.svg'
import bigote2 from '../assets/bigotes/bigote2.svg'
import bigote3 from '../assets/bigotes/bigote3.svg'

const video = document.getElementById('video') as HTMLVideoElement
let model: any
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const accessCamera = () => {
  const container = document.getElementById('canvas-container')
  return navigator.mediaDevices
    .getUserMedia({
      video: {
        width: container!.offsetWidth,
        height: window.matchMedia('(orientation: portrait)').matches
          ? (container!.offsetWidth * 4) / 3
          : (container!.offsetWidth * 3) / 4,
      },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream
    })
}

const resizeCanvas = () => {
  const container = document.getElementById('canvas-container') as HTMLDivElement
  canvas.width = container.offsetWidth
  canvas.height = window.matchMedia('(orientation: portrait)').matches
    ? (container!.offsetWidth * 4) / 3
    : (container!.offsetWidth * 3) / 4
}

const bigotes = [
  {
    src: bigote1,
    scale: 1.5,
    offset: 0.1,
  },
  {
    src: bigote2,
    scale: 1.05,
    offset: 1.25,
  },
  {
    src: bigote3,
    scale: 1.5,
    offset: -0.5,
  },
].map((b) => {
  const img = new Image()
  img.src = b.src
  return {
    ...b,
    img,
  }
})

let index = 0
let dimension = 1

const detectFaces = async () => {
  let predictions
  try {
    predictions = await model.estimateFaces(video, false)
  } catch (e) {
    return
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  predictions.forEach((prediction: any) => {
    const bigote = bigotes[index]
    const nose = prediction.landmarks[2]
    const mouth = prediction.landmarks[3]
    const width = prediction.landmarks[1][0] - prediction.landmarks[0][0]
    const imgW = bigote.img.naturalWidth,
      imgH = bigote.img.naturalHeight

    const ratio = (width / imgW) * bigote.scale * dimension

    ctx.globalAlpha = 0.8
    // const x = mouth[0] - nose[0];
    // const y = mouth[1] - nose[1];
    // const degrees = Math.atan2(-y, x);
    const centerX = (nose[0] + mouth[0]) / 2
    const centerY = (nose[1] + mouth[1]) / 2
    ctx.save()
    ctx.translate(centerX, centerY)
    // ctx.rotate(-degrees - Math.PI / 2);
    ctx.drawImage(
      bigote.img,
      -(imgW * ratio) / 2,
      -(imgH * ratio) / 2 + ((imgH * ratio) / 2) * bigote.offset,
      imgW * ratio,
      imgH * ratio
    )
    ctx.restore()
  })
}

const ui = () => {
  const select = document.getElementById('bigotes') as HTMLSelectElement
  select.addEventListener('change', (ev) => (index = +(ev.target! as HTMLSelectElement).value))
  const slider = document.getElementById('dimension') as HTMLInputElement
  slider.addEventListener('change', (ev) => (dimension = +(ev.target! as HTMLInputElement).value))
  const save = document.getElementById('save')
  save!.addEventListener('click', () => {
    const download = document.getElementById('download')
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    download!.setAttribute('href', image)
  })
}

let interval: any
const start = async () => {
  model = await blazeface.load()
  interval = setInterval(detectFaces, 40)
}

video.addEventListener('loadeddata', start)

window.addEventListener(
  'resize',
  async () => {
    clearInterval(interval)
    await accessCamera()
    resizeCanvas()
    interval = setInterval(detectFaces, 40)
  },
  false
)

const init = async () => {
  await accessCamera()
  resizeCanvas()
  ui()
}

init()
