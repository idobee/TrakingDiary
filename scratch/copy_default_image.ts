import * as fs from 'fs'
import * as path from 'path'

// Copy Default Image
const artifactsDir = 'C:\\Users\\leejo\\.gemini\\antigravity-ide\\brain\\2a3f1942-4644-4e57-9935-521d7505a5b2'
const publicDir = 'C:\\ITSTUDY\\TrakingDiary\\public\\images'
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

const src = path.join(artifactsDir, 'default_placeholder_1789550987634.jpg')
const dest = path.join(publicDir, 'default_image.jpg')

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest)
  console.log('Copied default_image.jpg')
} else {
  console.log('Image not found at', src)
}
