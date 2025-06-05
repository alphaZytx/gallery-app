// client/src/components/layout/Navbar.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Removed useNavigate as logout handles it
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { FiLogOut, FiGrid, FiUser, FiImage, FiSettings } from 'react-icons/fi';

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.navbarBg};
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  height: 60px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 1rem;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 55px;
  }
`;

const LogoLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-family: ${({ theme }) => theme.primaryFont};
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: color 0.2s ease;

  &:hover { color: ${({ theme }) => theme.primaryHover}; }
  svg { font-size: 1.7rem; stroke-width: 2; }

  .logo-text {
    @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
      display: none;
    }
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduced default gap */

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.2rem; /* Further reduced for mobile */
  }
`;

// Common class for nav link text to hide on smaller screens
const NavLinkText = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  padding: 0.5rem 0.75rem; /* Keep padding consistent */
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    background-color: ${({ theme }) => theme.body === '#1A1D24' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
    color: ${({ theme }) => theme.primary};
    /* transform: translateY(-1px); // Optional subtle hover effect */
  }

  &.active {
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
    background-color: ${({ theme }) => theme.primary}1A;
  }

  svg {
    font-size: 1.1rem; /* Consistent icon size */
    stroke-width: 2;
  }
`;

const AdminInfo = styled.div`
  /* ... (keep existing styles from previous correct version) ... */
  @media (max-width: 1100px) { /* Hide earlier */
    display: none; 
  }
`;

// Styled Logout Button for better control
const LogoutButton = styled(Button)`
  /* Add this class to the NavLinkText span inside the button if text exists */
  .nav-link-text { 
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      display: none;
    }
  }
  /* If it's icon-only by default on small screens, padding will be handled by Button's $iconOnly prop */
`;


const Navbar = () => {
  const { isAuthenticated, adminUser, logout } = useAuth();

  return (
    <Nav>
      <LogoLink to="/">
        <FiImage /> 
        <span className="logo-text">MediaGallery</span>
      </LogoLink>
      <NavItems>
        <StyledNavLink to="/" end title="Public Gallery">
          <FiGrid /> <NavLinkText>Gallery</NavLinkText>
        </StyledNavLink>

        {isAuthenticated && adminUser && (
          <>
            <AdminInfo>
              <FiUser /> {adminUser.email}
            </AdminInfo>
            <StyledNavLink to="/admin/dashboard" title="Admin Dashboard">
              <FiSettings /> <NavLinkText>Dashboard</NavLinkText>
            </StyledNavLink>
            <LogoutButton 
              onClick={logout} 
              variant="outline" 
              iconStart={<FiLogOut />} 
              size="small" 
              title="Logout"
            >
              <NavLinkText>Logout</NavLinkText>
            </LogoutButton>
          </>
        )}
        <ThemeToggle />
      </NavItems>
    </Nav>
  );
};

export default React.memo(Navbar);