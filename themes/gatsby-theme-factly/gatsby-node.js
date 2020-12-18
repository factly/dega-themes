const fs = require('fs');
const fetch = require('node-fetch');
const mkdirp = require('mkdirp');

const saveIcon = async (url) => {
  await fetch(url)
    .then((res) => res.buffer())
    .then((buffer) =>
      fs.writeFile('./src/Icons/favicon.png', buffer, () =>
        console.log('finished loading favicon to src icons'),
      ),
    );
  return;
};

exports.onPreBootstrap = ({ store }) => {
  const { program } = store.getState();
  const dir = `${program.directory}/src/Icons`;
  console.log(`ensuring ${dir} exists`);
  if (!fs.existsSync(dir)) {
    console.log(`creating ${dir}`);
    mkdirp.sync(dir);
  }
};

exports.createPages = async ({ graphql, actions, store, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query NodeQuery {
      dega {
        space {
          id
          name
          slug
          site_title
          tag_line
          description
          site_address
          logo {
            url
          }
          logo_mobile {
            url
          }
          fav_icon {
            url
          }
          mobile_icon {
            url
          }
          verification_codes
          social_media_urls
          contact_info
        }
        sitemap {
          tags {
            id
            slug
          }
          categories {
            id
            slug
          }
          users {
            id
            slug
          }
          posts {
            id
            slug
          }
          formats {
            id
            slug
          }
        }
      }
    }
  `);

  var format_factcheck = [];
  var format_without_factcheck = [];
  result.data.dega.sitemap.formats
    .filter((item) => item.slug === 'fact-check')
    .forEach((item) => {
      format_factcheck.push(parseInt(item.id));
    });

  result.data.dega.sitemap.formats
    .filter((item) => item.slug !== 'fact-check')
    .forEach((item) => {
      format_without_factcheck.push(parseInt(item.id));
    });
  // manifest
  let icon;
  icon = result.data.dega.space.fav_icon && result.data.dega.space.fav_icon.url.raw;
  console.log(result.data.dega.space);
  if (icon) {
    saveIcon(icon);
  } else {
    reporter.log('no favicon found on your space!!');
  }

  const state = store.getState();

  const plugin = state.flattenedPlugins.find((plugin) => plugin.name === 'gatsby-plugin-manifest');

  const resolveManifestOptions = (data) => {
    return {
      name: data.name,
      short_name: data.name,
      start_url: '/',
      background_color: '#ffffff',
      theme_color: `#ffffff`,
      display: `minimal-ui`,
      icon: './src/Icons/favicon.png',
    };
  };
  if (plugin) {
    const manifestOptions = await resolveManifestOptions(result.data.dega.space);
    plugin.pluginOptions = { ...plugin.pluginOptions, ...manifestOptions };
  }
  // homepage
  createPage({
    path: '/',
    component: require.resolve('./src/templates/homepage.js'),
    context: {
      format_factcheck,
      format_without_factcheck,
    },
  });

  result.data.dega.sitemap.formats.forEach((format) => {
    createPage({
      path: `/formats/${format.slug}`,
      component: require.resolve('./src/templates/format-details.js'),
      context: {
        id: parseInt(format.id),
      },
    });
  });

  // create post details page
  result.data.dega.sitemap.posts.forEach((post) => {
    createPage({
      path: `/${post.slug}`,
      component: require.resolve('./src/templates/post-details.js'),
      context: {
        id: parseInt(post.id),
      },
    });
    createPage({
      path: `/${post.slug}/amp/`,
      component: require.resolve('./src/templates/post-details.amp.js'),
      context: {
        id: parseInt(post.id),
      },
    });
  });

  // create tag details page
  result.data.dega.sitemap.tags.forEach((tag) => {
    createPage({
      path: `/tags/${tag.slug}`,
      component: require.resolve('./src/templates/tag-details.js'),
      context: {
        id: parseInt(tag.id),
      },
    });

    // create tag details page with each format
    result.data.dega.sitemap.formats.forEach((format) => {
      createPage({
        path: `/tags/${tag.slug}/formats/${format.slug}`,
        component: require.resolve('./src/templates/tag-details-format-details.js'),
        context: {
          id: parseInt(tag.id),
          format_id: parseInt(format.id),
        },
      });
    });
  });

  // create category details page
  result.data.dega.sitemap.categories.forEach((category) => {
    createPage({
      path: `/categories/${category.slug}`,
      component: require.resolve('./src/templates/category-details.js'),
      context: {
        id: parseInt(category.id),
      },
    });

    // create category details page with each format
    result.data.dega.sitemap.formats.forEach((format) => {
      createPage({
        path: `/categories/${category.slug}/formats/${format.slug}`,
        component: require.resolve('./src/templates/category-details-format-details.js'),
        context: {
          id: parseInt(category.id),
          format_id: parseInt(format.id),
        },
      });
    });
  });

  // create user details page
  result.data.dega.sitemap.users.forEach((user) => {
    createPage({
      path: `/users/${user.id}`,
      component: require.resolve('./src/templates/user-details.js'),
      context: {
        id: parseInt(user.id),
      },
    });

    // create user details page with each format
    result.data.dega.sitemap.formats.forEach((format) => {
      createPage({
        path: `/users/${user.id}/formats/${format.slug}`,
        component: require.resolve('./src/templates/user-details-format-details.js'),
        context: {
          id: parseInt(user.id),
          format_id: parseInt(format.id),
        },
      });
    });
  });
};
