import sharp from 'sharp'

export async function watermarkImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    const image = sharp(buffer)
    const metadata = await image.metadata()
    const width = metadata.width || 800
    const height = metadata.height || 600

    const svgWatermark = Buffer.from(
      `<svg width="${width}" height="${height}">
        <rect x="${width - 200}" y="${height - 40}" width="190" height="30" rx="4" fill="rgba(0,0,0,0.5)" />
        <text x="${width - 105}" y="${height - 20}" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
          TCO Official
        </text>
      </svg>`
    )

    const watermarked = await image
      .composite([{ input: svgWatermark, top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer()

    const base64 = watermarked.toString('base64')
    const mimeType = `image/jpeg`

    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error watermarking image:', error)
    return imageUrl
  }
}
