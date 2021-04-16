/** @jsx jsx */
import React from 'react';
import { jsx } from 'theme-ui';
import { Link } from 'gatsby';
import './layout.css';
import '../static/main.css';

const Layout = ({ children }) => {
  const logo = 'https://palcehold.it/96x54';
  const imgSrc = '/logo.png';
  const addDefaultSrc = (e) => (e.target.src = placeholderLogo);
  const products = [
    { name: 'Factly Stories', link: 'https://factly.in' },
    { name: 'Factly Videos', link: 'https://videos.factly.in' },
    { name: 'Counting India', link: 'https://countingindia.com' },
  ];
  return (
    <>
      <div
        sx={{
          zIndex: '9999',
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          backgroundColor: 'white',
          borderBottomWidth: '1px',
          borderColor: '#e2e8f0',
        }}
      >
        <header
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: '1px',
            borderColor: `#f7fafc`,
            fontSize: 1,
            fontWeight: 'semibold',
            color: `#2d3748`,
            boxShadow: `rgba(17, 17, 26, 0.1) 0px 4px 16px,rgba(17, 17, 26, 0.05) 0px 8px 32px`,
          }}
        >
          <nav
            sx={{
              display: 'flex',
              flexGrow: '1',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: [0, 0, 0, 4],
              height: ['55px', '55px', '55px', '70px'],
              whiteSpace: 'nowrap',
            }}
          >
            {/* <div
              sx={{
                display: 'flex',
                flex: '1 1 0%',
                order: [2, 2, 2, 1],
                alignItems: 'center',
                justifyContent: ['flex-end', 'flex-end', 'flex-end', 'justify-start'],
              }}
            >
              {leftNavItems.length > 0 &&
                leftNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    sx={{
                      display: 'block',
                      p: [2, 2, 2, 4],
                      textTransform: 'uppercase',
                      fontWeight: 'semibold',
                      color: 'inherit',
                      '&:focus': { outline: 'none' },
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
            </div> */}
            <div sx={{ order: [1, 1, 1, 2], p: 2 }}>
              <Link to="/" sx={{ display: 'inline-block' }}>
                <img
                  sx={{ height: [6, 6, 6, 8] }}
                  src={imgSrc}
                  alt="factly"
                  //onError={addDefaultSrc}
                />
              </Link>
            </div>
            <div
              sx={{
                display: 'flex',
                flex: '1 1 0%',
                order: [2, 2, 2, 3],
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Link
                to="/about"
                sx={{
                  display: 'block',
                  p: [2, 2, 2, 4],
                  textTransform: 'uppercase',
                  fontWeight: 'semibold',
                  color: 'inherit',
                  '&:focus': { outline: 'none' },
                }}
              >
                About
              </Link>
              <div
                className="dropdown"
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  p: [2, 2, 2, 4],
                  textTransform: 'uppercase',
                  fontWeight: 'semibold',
                  color: 'inherit',
                  '&:hover ul': { display: 'block' },
                }}
              >
                More from Us
                <ul
                  className="dropdown-content"
                  sx={{
                    display: 'none',
                    position: 'absolute',
                    top: '2.5rem',
                    right: 0,
                    padding: '0.75rem 1rem',
                    zIndex: 1,
                    listStyleType: 'none',
                    bg: '#f9f9f9',
                    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
                  }}
                >
                  {products.map((item, i) => (
                    <li key={i} sx={{ textAlign: 'center' }}>
                      <a
                        sx={{ padding: '1rem', display: 'inline-block', color: 'inherit' }}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </header>
      </div>

      <main sx={{ maxWidth: 1280, mx: [4, null, null, null, 'auto'], pt: '90px' }}>{children}</main>
      <footer
        sx={{
          fontSize: 1,
          textAlign: 'right',
          my: 8,
          pr: 4,
          color: (theme) => `${theme.colors.gray[6]}`,
        }}
      >
        &copy; Factly {new Date().getFullYear()}. All rights reserved
      </footer>
    </>
  );
};

export default Layout;
