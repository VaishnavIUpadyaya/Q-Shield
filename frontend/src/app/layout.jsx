import "./globals.css";

export const metadata = {
  title: "Q-SHIELD · Quantum Cyber Threat Detection Framework",
  description: "Next-generation quantum cyber threat detection framework for teleportation-based Quantum Digital Signatures (QDS) without AI/ML.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070f] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
