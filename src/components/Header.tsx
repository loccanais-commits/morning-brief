"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PushNotificationButton from "./PushNotificationButton";

// Função para saudação baseada no horário
function getGreeting(): string {
  const hour = new Date().getHours();
  // Good Morning: 05h às 12h
  if (hour >= 5 && hour < 12) return "Good Morning";
  // Good Afternoon: 12h às 18h  
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  // Good Night: 18h às 04h59
  return "Good Night";
}

// Ícones SVG
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  archive: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1"/>
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
      <path d="M10 12h4"/>
    </svg>
  ),
  about: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FB923C" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
};

interface NavButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  isActive?: boolean;
}

function NavButton({ href, icon, label, color, isActive }: NavButtonProps) {
  return (
    <Link
      href={href}
      className={`
        cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 
        rounded-lg text-sm font-medium transition-colors h-9 px-3
        hover:bg-[#F5F5F5]
        ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0a]' : ''}
      `}
      style={{ 
        color: isActive ? color : '#333',
        // @ts-ignore
        '--hover-color': color,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isActive ? color : '#333';
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const greeting = getGreeting();
  
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Greeting */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
                </svg>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-white leading-tight">Morning Brief</h1>
                <p className="text-xs text-[var(--text-muted)]">Daily Geopolitics</p>
              </div>
            </Link>
          </div>

          {/* Greeting - Center */}
          <div className="hidden lg:block text-center">
            <p className="text-[var(--accent-primary)] font-semibold">{greeting}</p>
            <p className="text-xs text-[var(--text-muted)]">{today}</p>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center gap-2">
            <NavButton 
              href="/" 
              icon={Icons.home} 
              label="Today" 
              color="#06B6D4"
              isActive={pathname === "/"}
            />
            <NavButton 
              href="/archive" 
              icon={Icons.archive} 
              label="Archive" 
              color="#60A5FA"
              isActive={pathname === "/archive"}
            />
            <NavButton 
              href="/favorites" 
              icon={Icons.star} 
              label="Favorites" 
              color="#FB923C"
              isActive={pathname === "/favorites"}
            />
            <NavButton 
              href="/about" 
              icon={Icons.about} 
              label="About" 
              color="#FACC14"
              isActive={pathname === "/about"}
            />
            
            {/* Push Notification Button */}
            <div className="hidden md:block ml-2">
              <PushNotificationButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
