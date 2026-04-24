// filepath: src/Componenets/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/CluVer.png';

const AuthLayout = ({ children, title, subtitle, showLogo = true }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#06163A] via-[#0a1f4a] to-[#06163A]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#a93226]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#0f1e3d]/50 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="w-full max-w-md relative z-10">
        {showLogo && (
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src={logo} alt="CluVersity" className="w-32 h-32 mx-auto object-contain" />
            </Link>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-1 bg-[#c0392b] mx-auto mb-6"></div>
            {title && <h1 className="text-white text-3xl font-bold mb-2">{title}</h1>}
            {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
          </div>
          {children}
        </div>
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm">© 2024 CluVersity. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;