import "./globals.css";
import ThemeInit from "../components/ThemeInit";

export const metadata = {
  title: "Pojok Gizi by Aden",
  description: "Digital Nutrition Monitoring & Consultation Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
