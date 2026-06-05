export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const apiKey = process.env.IMGBB_SECRET
    if (!apiKey) {
      return NextResponse.json({ error: "ImgBB not configured" }, { status: 500 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    const imgbbForm = new FormData()
    imgbbForm.append("image", base64)

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbForm,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("ImgBB upload error:", errText)
      return NextResponse.json({ error: "ImgBB upload failed" }, { status: 500 })
    }

    const data = await res.json()
    const url = data.data?.url

    if (!url) {
      return NextResponse.json({ error: "Invalid ImgBB response" }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
