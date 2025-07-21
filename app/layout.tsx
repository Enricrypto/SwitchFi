import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { Web3Provider } from '../providers/Web3Provider';
import PoolsProvider from '../providers/PoolsProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <Web3Provider>
            <PoolsProvider />
            {children}
            <ToastContainer position="top-right" autoClose={4000} />
          </Web3Provider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
