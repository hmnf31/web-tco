export type Announcement = {
  id: string
  title: string
  content: string
  eventDate: string
  endDate: string
  link?: { text: string; url: string }
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "tco-night-18-may-2026",
    title: "⚡ TCO NIGHT TOURNAMENT: TCO X RESTU AZI KUSUMA ⚡",
    content:
      "Turnamen Blitz Catur Online, penuh hadiah!\n📅 Waktu: Senin, 18 Mei 2026, Jam 21:00 WIB - Selesai\n🕒 Format: Blitz 5 Menit (Tanpa Increment) | Swiss System 9 Babak\n📱 Live Streaming: TikTok @tco.tiktok\n🌐 Platform: Chess.com\n\n💰 HADIAH PERTANDINGAN\n🥇 Juara 1: Rp 30.000\n🥈 Juara 2: Rp 20.000\n🥉 Juara 3: Rp 10.000\n🦆 Doorprize Balap Bebek (Live): 4 orang beruntung x Rp 5.000",
    eventDate: "2026-05-18T21:00:00+07:00",
    endDate: "2026-05-18T23:59:00+07:00",
    link: {
      text: "Ikuti Turnamen",
      url: "https://www.chess.com/play/tournament/6480175",
    },
  },
]

export function getActiveAnnouncements(): Announcement[] {
  const now = new Date()
  return ANNOUNCEMENTS.filter((a) => new Date(a.endDate) > now)
}

export function getAllAnnouncements(): Announcement[] {
  return [...ANNOUNCEMENTS].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  )
}

export function isAnnouncementActive(announcement: Announcement): boolean {
  return new Date(announcement.endDate) > new Date()
}
