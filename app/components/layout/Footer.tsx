import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-100 mt-20 pt-16 pb-10 px-5 border-t border-slate-200 w-full box-border">
      <div className="max-w-[1200px] mx-auto">

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 justify-items-center">

          {/* Column 1: COMPANY */}
          <div>
            <h3 className="text-xs font-black text-hsp-gray uppercase tracking-widest mb-5">Company</h3>
            <ul className="list-none p-0 m-0">
              <li className="mb-3"><Link href="/about" className="text-hsp-dark no-underline text-base font-medium">About Us</Link></li>
              <li className="mb-3"><Link href="/pricing" className="text-hsp-dark no-underline text-base font-medium">Pricing</Link></li>
              <li className="mb-3"><Link href="/learn-more" className="text-hsp-dark no-underline text-base font-medium">Learn More</Link></li>
              <li><Link href="/contact" className="text-hsp-dark no-underline text-base font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 2: ACCOUNT */}
          <div>
            <h3 className="text-xs font-black text-hsp-gray uppercase tracking-widest mb-5">Account</h3>
            <ul className="list-none p-0 m-0">
              <li className="mb-3"><a href="#" className="text-hsp-dark no-underline text-base font-medium">Login</a></li>
              <li><a href="#" className="text-hsp-dark no-underline text-base font-medium">Sign Up</a></li>
            </ul>
          </div>

          {/* Column 3: CONNECT */}
          <div>
            <h3 className="text-xs font-black text-hsp-gray uppercase tracking-widest mb-5">Connect</h3>
            <ul className="list-none p-0 m-0">
              <li className="mb-3 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <a href="https://www.facebook.com/high.school.prospect/" target="_blank" rel="noopener noreferrer" className="no-underline text-base font-medium" style={{color: '#1877F2'}}>Facebook</a>
              </li>
              <li className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FD5949" />
                      <stop offset="25%" stopColor="#D6249F" />
                      <stop offset="50%" stopColor="#833AB4" />
                      <stop offset="75%" stopColor="#FD1D1D" />
                      <stop offset="100%" stopColor="#F77737" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#instagramGradient)"/>
                  <rect x="5" y="5" width="14" height="14" rx="3" ry="3" fill="none" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5"/>
                  <circle cx="16.5" cy="7.5" r="0.8" fill="white"/>
                </svg>
                <a href="https://www.instagram.com/high.school.prospect/" target="_blank" rel="noopener noreferrer" className="no-underline text-base font-medium" style={{color: '#E1306C'}}>Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 flex-wrap">
          <p className="text-xs text-hsp-gray m-0 text-center md:text-left">
            © 2026 Ripoll Services, LLC. All Rights Reserved.
          </p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link href="/terms-and-conditions" className="text-hsp-gray no-underline text-xs whitespace-nowrap">Terms and Conditions</Link>
            <Link href="/privacy-policy" className="text-hsp-gray no-underline text-xs whitespace-nowrap">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
