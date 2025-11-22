// app/layout.jsx

export const metadata = {
  title: "AI Data Quality",
  description: "Upload datasets and get automated analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
