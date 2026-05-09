# Favicon Senhor Melo - versão aprovada

Suba todos os arquivos desta pasta para:

/public

Arquivos:
- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png
- icon-192.png
- icon-512.png
- manifest.json

No app/layout.tsx, use:

icons: {
  icon: [
    { url: "/favicon.ico" },
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
  ],
  apple: "/apple-touch-icon.png"
}
