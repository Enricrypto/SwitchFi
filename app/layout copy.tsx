import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { Web3Provider } from '../providers/Web3Provider';
import PoolsProvider from '../providers/PoolsProvider';
import { ToastContainer } from 'react-toastify';
import { Rubik } from 'next/font/google';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout2({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <ReactQueryProvider>
          <Web3Provider>
            <PoolsProvider />
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={4000} />
          </Web3Provider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
