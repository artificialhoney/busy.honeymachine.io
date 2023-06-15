import './style.css'

import * as Tone from 'tone'

import bass from '../assets/mp3/bass.mp3'
import hhClosed from '../assets/mp3/hh-closed.mp3'
import hhOpen from '../assets/mp3/hh-open.mp3'
import kick from '../assets/mp3/kick.mp3'
import sample from '../assets/mp3/sample.mp3'

const makeSampler = () => {
  return new Tone.Sampler({
    urls: {
      C1: bass,
      C2: kick,
      C3: hhClosed,
      C4: hhOpen,
      C5: sample,
    },
  }).toDestination()
}

const makeGrid = (notes: string[]) => {
  // our "notation" will consist of an array with 6 sub arrays
  // each sub array corresponds to one row in our sequencer grid

  // parent array to hold each row subarray
  const rows = []

  for (const note of notes) {
    // declare the subarray
    const row = []
    // each subarray contains multiple objects that have an assigned note
    // and a boolean to flag whether they are "activated"
    // each element in the subarray corresponds to one eigth note
    for (let i = 0; i < 8; i++) {
      switch (note) {
        case 'C1':
        case 'C2':
          row.push({
            note: note,
            isActive: i % 2 === 0,
          })
          break
        case 'C3':
          row.push({
            note: note,
            isActive: i % 2 === 1,
          })
          break
        case 'C4':
          row.push({
            note: note,
            isActive: i % 4 === 1,
          })
          break
        case 'C5':
          row.push({
            note: note,
            isActive: i % 4 === 0,
          })
          break
      }
    }
    rows.push(row)
  }

  // we now have 6 rows each containing 16 eighth notes
  return rows
}

const sampler = makeSampler()

// declaring the notes for each row
const notes = ['C1', 'C2', 'C3', 'C4', 'C5']
const grid = makeGrid(notes)
let beat = 0
let playing = false
let started = false

const configLoop = () => {
  const repeat = (time: number) => {
    grid.forEach((row) => {
      const note = row[beat]
      if (note.isActive) {
        sampler.triggerAttackRelease(note.note, note.note === 'C5' ? '2n' : '8n', time)
      }
    })

    beat = (beat + 1) % 8
  }

  Tone.Transport.bpm.value = 120
  Tone.Transport.scheduleRepeat(repeat, '8n')
}

const makeSequencer = () => {
  const sequencer = document.getElementById('sequencer')
  grid.forEach((row, rowIndex) => {
    const seqRow = document.createElement('div')
    seqRow.id = `rowIndex`
    seqRow.className = 'flex grid grid-cols-8 gap-2 pb-2'

    row.forEach((note, noteIndex) => {
      const button = document.createElement('button')
      button.className = `bg-white h-10 md:h-20 block rounded-md ${
        note.isActive ? '!bg-purple-500' : ''
      }`
      button.addEventListener('click', function (e) {
        handleNoteClick(rowIndex, noteIndex, e)
      })

      seqRow.appendChild(button)
    })

    sequencer!.appendChild(seqRow)
  })
}

const handleNoteClick = (clickedRowIndex: number, clickedNoteIndex: number, e: MouseEvent) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((note, noteIndex) => {
      if (clickedRowIndex === rowIndex && clickedNoteIndex === noteIndex) {
        note.isActive = !note.isActive
        const list = (e.target! as HTMLElement).classList
        note.isActive ? list.add('!bg-purple-500') : list.remove('!bg-purple-500')
      }
    })
  })
}

const configPlayButton = () => {
  const button = document.getElementById('play-button')
  button!.addEventListener('click', (e) => {
    if (!started) {
      Tone.start()
      Tone.getDestination().volume.rampTo(-10, 0.001)
      configLoop()
      started = true
    }

    if (playing) {
      (e.target! as HTMLElement).innerText = 'Play'
      Tone.Transport.stop()
      playing = false
    } else {
      (e.target! as HTMLElement).innerText = 'Stop'
      Tone.Transport.start()
      playing = true
    }
  })
}

/* configPlayButton();
makeSequencer(); */
window.addEventListener('DOMContentLoaded', () => {
  configPlayButton()
  makeSequencer()
})
