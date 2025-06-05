import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
// import { useTheme } from '../../hooks/useTheme'; // Not directly used for logic here, but theme context applies styles
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { FiLogOut, FiGrid, FiUser, FiImage } from 'react-icons/fi'; // Changed FiGrid to FiImage for logo for variety

const Nav = styled.nav`
  background-color: ${({ theme }) => theme.navbarBg};
  color: ${({ theme }) => theme.text};
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  height: 60px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0.5rem 1rem;
    height: 55px;
  }
`;

const LogoLink = styled(Link)`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-family: ${({ theme }) => theme.primaryFont};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: none;
    color: ${({ theme }) => theme.primaryHover};
  }

  svg { /* Style for logo icon */
    font-size: 1.8rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1.4rem;
    svg { font-size: 1.6rem; }
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.5rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background-color: ${({ theme }) => theme.body === '#1A1D24' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    color: ${({ theme }) => theme.primary};
  }

  &.active {
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
  }

  svg {
    font-size: 1.1rem;
  }

  .nav-link-text {
    /* This class is used to hide text on smaller screens if desired elsewhere */
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    /* Example: Hide text for some links on medium screens */
    /* &.hide-text-md .nav-link-text { display: none; } */
    /* padding: 0.5rem; */
  }
`;

const AdminInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
  padding-right: 0.5rem;

  svg {
    color: ${({ theme }) => theme.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none; 
  }
`;


const Navbar = () => {
  const { isAuthenticated, adminUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This already navigates to /admin/login via AuthContext
  };

  return (
    <Nav>
      <LogoLink to="/">
        <FiImage /> {/* Using FiImage for gallery logo */}
        <span>MediaGallery</span>
      </LogoLink>
      <NavItems>
        {/* Publicly visible gallery link */}
        <StyledNavLink to="/" end>
          <FiGrid /> <span className="nav-link-text">Gallery</span>
        </StyledNavLink>

        {/* Admin-specific links - only shown if authenticated */}
        {isAuthenticated && adminUser && (
          <>
            <AdminInfo>
              <FiUser /> {adminUser.email}
            </AdminInfo>
            <StyledNavLink to="/admin/dashboard">
              {/* Using FiGrid for dashboard icon */}
              <FiGrid /> <span className="nav-link-text">Dashboard</span>
            </StyledNavLink>
            <Button onClick={handleLogout} variant="outline" iconStart={<FiLogOut />} size="small">
              <span className="nav-link-text">Logout</span>
            </Button>
          </>
        )}
        
        {/* Theme toggle is always visible */}
        <ThemeToggle />
      </NavItems>
    </Nav>
  );
};

export default Navbar;