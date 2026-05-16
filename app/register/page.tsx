import { Swords } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <Swords className="mx-auto h-10 w-10 text-cyan-400" />
        <h1 className="mt-4 text-3xl font-bold text-white">Daftar Member TCO</h1>
        <p className="mt-2 text-white/50">Isi form Google di bawah untuk bergabung dengan komunitas TCO Esports</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdDksXEPyEG3BGtixLQZmubXhXtqL2adnUShq23d2eOwZDMmQ/viewform?embedded=true"
          width="100%"
          height="3200"
          className="w-full"
          style={{ minHeight: "3200px" }}
        >
          Loading…
        </iframe>
      </div>
    </div>
  )
}
