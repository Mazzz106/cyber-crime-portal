import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'File Complaint' },
    { path: '/track', label: 'Track Complaint' },
    { path: '/ongoing', label: 'Ongoing Cases' },
    { path: '/results', label: 'Results' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Cyber Crime Complaint Portal
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              National Cyber Crime Reporting Division
            </p>
          </div>
        </div>
      </div>
      <div className="bg-blue-800 border-t border-blue-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between">
            <nav className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-sm text-blue-100 py-2">
              Ministry of Home Affairs | Government Portal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
