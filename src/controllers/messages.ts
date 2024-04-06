export const specialMessages = {
join: `
Terima kasih telah menambahkan saya.
Untuk memulai, tambahkan channel yang ingin didengarkan dengan ketik \`as! reg <channel>\`.
Butuh bantuan? ketik \`as! help\`.
`,
unknown: 'Perintah tidak dikenal. Ketik `as! help` untuk melihat daftar perintah.',
noCmd: 'Ketik `as! help` untuk melihat daftar perintah.',
reg: {
    Usage: 'Perintah daftar channel anda tidak valid. Gunakan: `as! reg <channel>`.',
    Success: (channel: string) => `Berhasil mendaftarkan channel ${channel} pada grup.`,
    Failed: (channel: string) => `Grup sudah terdaftar pada channel ${channel}!`,
},
unreg: {
    Usage: 'Perintah hapus channel anda tidak valid. Gunakan: `as! unreg <channel>`.',
    Success: (channel: string) => `Berhasil menghapus channel ${channel} pada grup.`,
    Failed: (channel: string) => `Grup belum terdaftar pada channel ${channel}!`,
},
list: (channels: string[]) => channels.length > 0 ? `Channel yang sudah didaftarkan: \n- ${channels.join('\n- ')}` : 'Belum ada channel yang didaftarkan pada grup ini.',
};

export const defaultMessages: {[key: string]: string} = {
help: `
Daftar perintah:
\`as! reg <channel>\` - Mendaftarkan channel pada grup ini
\`as! unreg <channel>\` - Menghapus channel pada grup ini.
\`as! list\` - Menampilkan channel yang sudah didaftarkan pada grup ini.
\`as! help\` - Menampilkan bantuan ini.
`,
}
