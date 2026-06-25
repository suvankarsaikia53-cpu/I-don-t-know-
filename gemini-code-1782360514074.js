export const metadata = {
  title: 'Console Dashboard',
  description: 'Clean interface asset management platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        backgroundColor: '#0a0a0a', 
        color: '#ededed', 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        margin: 0,
        padding: 0 
      }}>
        {children}
      </body>
    </html>
  )
}