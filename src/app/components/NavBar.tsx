"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/snippets', label: 'Browse' },
  { href: '/snippets/create', label: 'Create' },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-primary border-b text-text">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Snippetly
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-lightGreen transition">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="hover:text-lightGreen transition">Profile</Link>
              <button
                className="ml-2 px-3 py-1 rounded bg-darkGreen text-text hover:bg-darkGreen/80 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
              <div className="ml-4 w-8 h-8 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold cursor-pointer" title="Profile">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link href="/login" className="ml-2 px-3 py-1 rounded bg-lightGreen text-primary hover:bg-lightGreen/80 transition">Login</Link>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden text-text focus:outline-none"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button className="block w-full text-left py-2 px-0 hover:text-lightGreen transition" onClick={handleLogout}>Logout</button>
              <div className="w-8 h-8 rounded-full bg-lightGreen flex items-center justify-center text-primary font-bold mt-2" title="Profile">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <Link href="/login" className="block py-2 hover:text-lightGreen transition" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
} 
// "use client";

// import Link from 'next/link';
// import { useState } from 'react';
// import { Menu, X, Code, Plus, Search, Home, LogOut, User, Settings } from 'lucide-react';
// import { useAuth } from "@/lib/auth-context";
// import { useRouter, usePathname } from "next/navigation";
// import AuthModal from "@/app/components/AuthModal";
// import { withErrorHandling } from "@/app/components/ErrorUtils";
// import { Avatar } from "@/app/components/SafeImage";

// const navLinks = [
//   { href: '/', label: 'Home', icon: Home },
//   { href: '/snippets', label: 'Browse', icon: Search },
// ];

// const authenticatedLinks = [
//   { href: '/snippets/create', label: 'Create', icon: Plus, primary: true },
// ];

// export default function NavBar() {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const { user, signOut, loading } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   const handleLogout = withErrorHandling(async () => {
//     await signOut();
//     setShowUserMenu(false);
//     setMobileOpen(false);
//     router.push("/");
//   }, 'Sign out');

//   const closeMobileMenu = () => setMobileOpen(false);
//   const closeUserMenu = () => setShowUserMenu(false);

//   const isActiveLink = (href: string) => {
//     if (href === '/') return pathname === '/';
//     return pathname.startsWith(href);
//   };

//   const NavLink = ({ href, label, icon: Icon, primary = false, mobile = false }: {
//     href: string;
//     label: string;
//     icon: React.ElementType;
//     primary?: boolean;
//     mobile?: boolean;
//   }) => {
//     const baseClasses = mobile
//       ? "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
//       : "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors";
    
//     const activeClasses = isActiveLink(href)
//       ? "bg-lightGreen text-primary"
//       : primary
//       ? "bg-lightGreen text-primary hover:bg-lightGreen/80"
//       : "text-text hover:text-lightGreen hover:bg-lightGreen/10";

//     return (
//       <Link
//         href={href}
//         onClick={mobile ? closeMobileMenu : undefined}
//         className={`${baseClasses} ${activeClasses}`}
//       >
//         <Icon className="w-4 h-4" />
//         <span className={mobile ? "text-base" : "hidden sm:inline"}>{label}</span>
//       </Link>
//     );
//   };

//   const UserAvatar = ({ mobile = false }: { mobile?: boolean }) => {
//     if (!user) return null;

//     const displayName = user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
//     const avatarUrl = user.user_metadata?.avatar_url;

//     return (
//       <div className={mobile ? "flex items-center gap-3 px-3 py-2" : "relative"}>
//         <Avatar
//           src={avatarUrl}
//           alt={displayName}
//           size={mobile ? 40 : 32}
//           fallbackText={displayName}
//           className="cursor-pointer"
//         />
//         {mobile ? (
//           <div>
//             <p className="font-medium text-text">{displayName}</p>
//             <p className="text-sm text-textSecondary">{user.email}</p>
//           </div>
//         ) : (
//           <button
//             onClick={() => setShowUserMenu(!showUserMenu)}
//             className="ml-2 text-text hover:text-lightGreen transition-colors"
//             aria-label="User menu"
//           >
//             <span className="hidden md:inline text-sm">{displayName}</span>
//           </button>
//         )}
//       </div>
//     );
//   };

//   return (
//     <>
//       <nav className="bg-primary border-b border-textSecondary sticky top-0 z-40">
//         <div className="container mx-auto flex items-center justify-between px-4 py-3">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 text-text hover:text-lightGreen transition-colors">
//             <Code className="w-6 h-6 text-lightGreen" />
//             <span className="text-xl font-bold tracking-tight">Snippetly</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-2">
//             {navLinks.map((link) => (
//               <NavLink key={link.href} {...link} />
//             ))}
            
//             {user && authenticatedLinks.map((link) => (
//               <NavLink key={link.href} {...link} />
//             ))}

//             {user ? (
//               <div className="flex items-center">
//                 <UserAvatar />
//                 {/* User Dropdown Menu */}
//                 {showUserMenu && (
//                   <div className="absolute right-0 top-full mt-2 w-48 bg-primary border border-textSecondary rounded-lg shadow-lg z-50">
//                     <div className="py-1">
//                       <Link
//                         href="/profile"
//                         onClick={closeUserMenu}
//                         className="flex items-center gap-2 px-4 py-2 text-text hover:bg-lightGreen/10 transition-colors"
//                       >
//                         <Settings className="w-4 h-4" />
//                         Profile Settings
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center gap-2 px-4 py-2 text-text hover:bg-red-500/10 hover:text-red-400 transition-colors"
//                       >
//                         <LogOut className="w-4 h-4" />
//                         Sign Out
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <button
//                 onClick={() => setShowAuthModal(true)}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-4 py-2 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium disabled:opacity-50"
//               >
//                 <User className="w-4 h-4" />
//                 <span className="hidden sm:inline">Sign In</span>
//               </button>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <button
//             className="md:hidden text-text focus:outline-none"
//             onClick={() => setMobileOpen(!mobileOpen)}
//             aria-label="Toggle menu"
//             aria-expanded={mobileOpen}
//           >
//             {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {/* Mobile menu */}
//         {mobileOpen && (
//           <div className="md:hidden border-t border-textSecondary bg-primary">
//             <div className="px-4 py-4 space-y-2">
//               {/* User info for mobile */}
//               {user && <UserAvatar mobile />}
              
//               {/* Navigation links */}
//               <div className="space-y-1">
//                 {navLinks.map((link) => (
//                   <NavLink key={link.href} {...link} mobile />
//                 ))}
                
//                 {user && authenticatedLinks.map((link) => (
//                   <NavLink key={link.href} {...link} mobile />
//                 ))}
                
//                 {user && (
//                   <>
//                     <Link
//                       href="/profile"
//                       onClick={closeMobileMenu}
//                       className="flex items-center gap-3 px-3 py-2 text-text hover:text-lightGreen hover:bg-lightGreen/10 rounded-lg transition-colors"
//                     >
//                       <Settings className="w-4 h-4" />
//                       Profile Settings
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center gap-3 px-3 py-2 text-text hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       Sign Out
//                     </button>
//                   </>
//                 )}
//               </div>
              
//               {/* Auth button for mobile */}
//               {!user && (
//                 <button
//                   onClick={() => {
//                     setShowAuthModal(true);
//                     closeMobileMenu();
//                   }}
//                   disabled={loading}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lightGreen text-primary rounded-lg hover:bg-lightGreen/80 transition-colors font-medium disabled:opacity-50 mt-4"
//                 >
//                   <User className="w-4 h-4" />
//                   Sign In
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Click outside to close user menu */}
//       {showUserMenu && (
//         <div
//           className="fixed inset-0 z-30"
//           onClick={closeUserMenu}
//         />
//       )}

//       {/* Auth Modal */}
//       <AuthModal
//         isOpen={showAuthModal}
//         onClose={() => setShowAuthModal(false)}
//       />
//     </>
//   );
// }