/** @jsx jsx */
import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from 'theme-ui';

const Tag = ({ url, name }) => {
  return (
    <Link
      to={`/tags/${url}`}
      sx={{
        textAlign: 'center',
        color: (theme) => `${theme.colors.white}`,
        fontSize: [1, null, 2],
        borderWidth: '1px',
        borderColor: (theme) => `${theme.colors.blue[5]}`,
        borderRadius: 'default',
        p: 2,
        m: 2,
        bg: (theme) => `${theme.colors.blue[5]}`,
        transition: '0.3s',
        '&:hover': {
          color: (theme) => `${theme.colors.blue[5]}`,
          bg: (theme) => `${theme.colors.white}`,
        },
      }}
    >
      {name}
    </Link>
  );
};

export default Tag;
