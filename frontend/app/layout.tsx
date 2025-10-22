import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Secrets Vault - Secure Storage',
  description: 'Securely store and manage your sensitive information with end-to-end encryption',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
