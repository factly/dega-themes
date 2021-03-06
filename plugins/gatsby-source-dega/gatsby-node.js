const { ApolloClient, InMemoryCache, ApolloLink, HttpLink, gql, from } = require('@apollo/client');

const { RetryLink } = require('@apollo/client/link/retry');
const { onError } = require('@apollo/client/link/error');
const { fetchWrapper } = require('./fetch');
const fetch = require('node-fetch');
const {
  getTotalQuery,
  getPostsQuery,
  getCategoriesQuery,
  getTagsQuery,
  getFormatsQuery,
  getClaimantsQuery,
  getRatingsQuery,
  getClaimsQuery,
  getMenuQuery,
  getSpaceQuery,
  getUsersQuery,
} = require('./queries');
const { createSchemaCustomization } = require('./createSchemaCustomization');

// Add customized Schema for data from dega-api
exports.createSchemaCustomization = createSchemaCustomization;

exports.onPreInit = () => console.log('loaded dega plugin');

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    uri: Joi.string().required().description(`api url`),
    spaceId: Joi.string().required().description(`Space Id`),
    accessToken: Joi.string().required().description(`Access Token.`),
  });
};
const POST_NODE_TYPE = `DegaPost`;
const CATEGORY_NODE_TYPE = `DegaCategory`;
const TAG_NODE_TYPE = `DegaTag`;
const FORMAT_NODE_TYPE = `DegaFormat`;
const USER_NODE_TYPE = `DegaUser`;
// const CLAIM_NODE_TYPE = `DegaClaim`;
// const CLAIMANT_NODE_TYPE = `DegaClaimant`;
// const SITEMAP_NODE_TYPE = `DegaSitemap`;
const SPACE_NODE_TYPE = `DegaSpace`;
const RATING_NODE_TYPE = `DegaRating`;
const MENU_NODE_TYPE = `DegaMenu`;

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId, getNodesByType, reporter },
  { spaceId, accessToken, uri },
) => {
  if (!spaceId) {
    reporter.panic('space id is not provided. please provide space id');
  }
  if (!accessToken) {
    reporter.panic('access token is not provided. please provide access token');
  }
  const retryLink = new RetryLink({
    delay: {
      initial: 200,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error,
    },
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      );

    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = new HttpLink({
    uri,
    // uri: 'http://dega-api.factly.org/query',
    fetch: fetchWrapper,
    headers: {
      'X-Space': spaceId,
      'X-Dega-API-Key': accessToken,
    },
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          menu: {
            merge: true,
          },
          formats: {
            merge: true,
          },
        },
      },
    },
  });

  const client = new ApolloClient({
    // Provide required constructor fields
    cache: cache,
    //  uri: 'http://dega-api.factly.org/query',
    link: from([retryLink, errorLink, httpLink]),
  });
  const { createNode } = actions;
  /**
   * @const {number} - default limit for entities
   */
  const LIMIT = 100;
  // total
  const getTotal = async () => {
    const totalResp = await client.query({
      query: getTotalQuery(),
    });
    return totalResp;
  };
  const { data: totalCount } = await getTotal();

  //! add page param to query when limit is reached
  /**
   *
   * @param {function} query - query function
   * @param {number} total - total count of the data entity
   * @param {string} type - name of the entity
   * @returns {Array}
   */
  const getData = async ({ query, total = LIMIT, type }) => {
    let allData = [];
    if (total <= LIMIT) {
      const resp = await client.query({
        query: query(),
      });
      allData = [...allData, ...resp.data[type].nodes];
    } else if (total > LIMIT) {
      const pageCount = Math.ceil(total / LIMIT);
      for (let page = 1; page <= pageCount; page++) {
        const resp = await client.query({
          query: query(page),
        });
        allData = [...allData, ...resp.data[type].nodes];
      }
    }
    return allData;
  };

  const posts = await getData({
    query: (page = 1) => getPostsQuery({ limit: LIMIT, page }),
    total: totalCount.posts.total,
    type: 'posts',
  });
  posts.forEach((post) => {
    createNode({
      ...post,
      id: post.id,
      gid: createNodeId(`${POST_NODE_TYPE}-${post.id}`),
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    });
  });

  // categories
  const categories = await getData({
    query: (page = 1) => getCategoriesQuery({ limit: LIMIT, page }),
    total: totalCount.categories.total,
    type: 'categories',
  });
  categories.forEach((category) => {
    createNode({
      ...category,
      id: category.id,
      gid: createNodeId(`${CATEGORY_NODE_TYPE}-${category.id}`),
      parent: null,
      children: [],
      internal: {
        type: CATEGORY_NODE_TYPE,
        content: JSON.stringify(category),
        contentDigest: createContentDigest(category),
      },
    });
  });

  // tags
  const tags = await getData({
    query: (page = 1) => getTagsQuery({ limit: LIMIT, page }),
    total: totalCount.tags.total,
    type: 'tags',
  });
  tags.forEach((tag) => {
    createNode({
      ...tag,
      id: tag.id,
      gid: createNodeId(`${TAG_NODE_TYPE}-${tag.id}`),
      parent: null,
      children: [],
      internal: {
        type: TAG_NODE_TYPE,
        content: JSON.stringify(tag),
        contentDigest: createContentDigest(tag),
      },
    });
  });

  // formats
  const formats = await getData({
    query: () => getFormatsQuery(),
    total: totalCount.formats.total,
    type: 'formats',
  });
  formats.forEach((format) => {
    createNode({
      ...format,
      id: format.id,
      gid: createNodeId(`${FORMAT_NODE_TYPE}-${format.id}`),
      parent: null,
      children: [],
      internal: {
        type: FORMAT_NODE_TYPE,
        content: JSON.stringify(format),
        contentDigest: createContentDigest(format),
      },
    });
  });
  // ratings
  const ratings = await getData({
    query: () => getRatingsQuery({ limit: LIMIT, page: 1 }),
    total: totalCount.ratings.total,
    type: 'ratings',
  });
  ratings.forEach((rating) => {
    createNode({
      ...rating,
      id: rating.id,
      gid: createNodeId(`${RATING_NODE_TYPE}-${rating.id}`),
      parent: null,
      children: [],
      internal: {
        type: RATING_NODE_TYPE,
        content: JSON.stringify(rating),
        contentDigest: createContentDigest(rating),
      },
    });
  });

  // menu
  const getMenus = async () => {
    const menus = await client.query({
      query: getMenuQuery(),
    });
    return menus;
  };
  const { data: menus } = await getMenus();
  menus.menu.nodes.forEach((menu) => {
    createNode({
      ...menu,
      id: menu.id,
      gid: createNodeId(`${MENU_NODE_TYPE}-${menu.id}`),
      parent: null,
      children: [],
      internal: {
        type: MENU_NODE_TYPE,
        content: JSON.stringify(menu),
        contentDigest: createContentDigest(menu),
      },
    });
  });

  // space
  const getSpace = async () => {
    const space = await client.query({
      query: getSpaceQuery(),
    });
    return space;
  };
  const spaceData = await getSpace();
  const space = spaceData.data.space;
  createNode({
    ...space,
    id: space.id,
    gid: createNodeId(`${SPACE_NODE_TYPE}-${space.id}`),
    parent: null,
    children: [],
    internal: {
      type: SPACE_NODE_TYPE,
      content: JSON.stringify(space),
      contentDigest: createContentDigest(space),
    },
  });

  // users
  const users = await getData({
    query: () => getUsersQuery({ limit: LIMIT, page: 1 }),
    total: totalCount.users.total,
    type: 'users',
  });
  users.forEach((user) => {
    createNode({
      ...user,
      id: user.id,
      gid: createNodeId(`${USER_NODE_TYPE}-${user.id}`),
      parent: null,
      children: [],
      internal: {
        type: USER_NODE_TYPE,
        content: JSON.stringify(user),
        contentDigest: createContentDigest(user),
      },
    });
  });
  return;
};
