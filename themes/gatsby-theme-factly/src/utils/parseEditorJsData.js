/** @jsx jsx */
import React from 'react';
import InnerHTML from 'dangerously-set-html-content';
import { jsx } from 'theme-ui';

const parseEditorJsData = (content, amp = false) => {
  const patterns = {
    youtube: [
      /^https?:\/\/(?:www\.)?youtube\.com\/(?:tv#\/)?watch\/?\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/youtu.be\/([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/m\.youtube\.com\/#\/watch\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/www\.youtube\.com\/user\/[a-zA-Z0-9_-]+\/?\?v=([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/www\.youtube-nocookie\.com\/(?:v|embed)\/([a-zA-Z0-9_-]+)/i,
    ],
    twitter: [/^https?:\/\/twitter\.com\/(?:\w+)\/status(?:es)?\/(\d+)/i],
    instagram: [
      /^https?:\/\/www\.instagram\.com\/(?:[a-zA-Z0-9_\-.]+\/)?(?:p|tv|reel)\/([a-zA-Z0-9_-]+)\/?/i,
      /^https?:\/\/instagr\.am\/(?:[a-zA-Z0-9_\-.]+\/)?p\/([a-zA-Z0-9_-]+)/i,
      /^https?:\/\/www\.instagram\.com\/(?:[a-zA-Z0-9_\-.]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)$/i,
    ],
  };

  // before removing useless escape ().) instagram: [
  //   /^https?:\/\/www\.instagram\.com\/(?:[a-zA-Z0-9_\-\.]+\/)?(?:p|tv|reel)\/([a-zA-Z0-9_-]+)\/?/i,
  //   /^https?:\/\/instagr\.am\/(?:[a-zA-Z0-9_\-\.]+\/)?p\/([a-zA-Z0-9_-]+)/i,
  //   /^https?:\/\/www\.instagram\.com\/(?:[a-zA-Z0-9_\-\.]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)$/i,
  // ],
  const ampify = (data, i) => {
    const getId = (url, site) => {
      for (let i = 0; i < patterns[site].length; ++i) {
        if (patterns[site][i].test(url)) {
          return patterns[site][i].exec(url)[1];
        }
      }

      return;
    };
    const getData = (data) => {
      let d = {
        src: '',
        width: '',
        height: '',
      };
      const pt = {
        src: /<iframe.+src=['"](.*?=?)['"]/i,
        width: /<iframe.+width=['"](.*?=?)['"]/i,
        height: /<iframe.+height=['"](.*?=?)['"]/i,
      };
      if (pt.src.test(data)) {
        d.src = pt.src.exec(data)[1];
      }
      if (pt.width.test(data)) {
        d.width = pt.width.exec(data)[1];
      }
      if (pt.height.test(data)) {
        d.height = pt.height.exec(data)[1];
      }
      return d;
    };

    let tw = {
      id: getId(data.meta.canonical, 'twitter'),
    };
    let yt = {
      id: getId(data.meta.canonical, 'youtube'),
    };
    let fb = {
      type: data.meta.type,
      url: data.meta.canonical,
    };
    let insta = {
      id: getId(data.meta.canonical, 'instagram'),
    };
    //  let pint = {
    //    url: data.meta.canonical
    //  }
    let ifr = getData(data.html);
    switch (data.meta.site) {
      case 'Twitter':
        return (
          <amp-twitter
            key={i}
            width="375"
            height="472"
            layout="responsive"
            data-tweetid={tw.id}
          ></amp-twitter>
        );
      case 'Facebook':
        return (
          <amp-facebook
            key={i}
            width="552"
            height="310"
            layout="responsive"
            data-embed-as="video"
            data-href={fb.url}
          ></amp-facebook>
        );
      case 'YouTube':
        return (
          <amp-youtube
            key={i}
            title={data.meta.title}
            data-videoid={yt.id}
            layout="responsive"
            width="480"
            height="270"
          ></amp-youtube>
        );
      case 'Instagram':
        return (
          <amp-instagram
            key={i}
            data-shortcode={insta.id}
            data-captioned
            width="400"
            height="400"
            layout="responsive"
          ></amp-instagram>
        );
      //     case 'Pinterest':
      //       return <amp-pinterest key={i}
      //       data-do="embedPin"
      //       width="245"
      // height="245"
      // layout="responsive"
      //       data-url={data.meta.canonical}></amp-pinterest>
      default:
        return ifr.src ? (
          <amp-iframe
            key={i}
            width={ifr.width || '200'}
            height={ifr.height || '100'}
            sandbox="allow-scripts allow-same-origin"
            layout="responsive"
            frameborder="0"
            src={ifr.src}
          ></amp-iframe>
        ) : (
          ''
        );
    }
  };
  const { blocks } = content;

  const htm = (
    <>
      {blocks.map((block, i) => {
        const { data } = block;
        let HeaderTag;
        let style;
        let ListTag;
        let list;
        if (data.level) {
          HeaderTag = `h${data.level}`;
        }

        if (data.style) {
          style = data.style === 'unordered' ? 'ul' : 'ol';
          ListTag = `${style}`;
          list = data.items
            .map((listItem, i) => {
              return <li key={i}> {listItem} </li>;
            })
            .reduce((a, c) => [a, '', c]);
        }

        switch (block.type) {
          case 'header':
            return (
              <HeaderTag key={i} dangerouslySetInnerHTML={{ __html: data.text }} sx={{ py: 2 }} />
            );
          case 'paragraph':
            return (
              <p
                key={i}
                dangerouslySetInnerHTML={{ __html: data.text }}
                sx={{ py: 1, a: { display: 'block' } }}
              />
            );

          case 'list':
            return (
              <ListTag sx={{ listStylePosition: 'inside', listStyleType: 'disc', pl: 4 }} key={i}>
                {list}
              </ListTag>
            );
          case 'uppy':
            return (
              <React.Fragment key={i}>
                <img sx={{ mx: 'auto', py: 4 }} src={data.url.raw} alt={data.alt_text} />
                {data.caption && <p className="img-caption">{data.caption}</p>}
              </React.Fragment>
            );

          case 'embed':
            return amp ? (
              ampify(data, i)
            ) : (
              <InnerHTML className="embeds" key={i} html={data.html} sx={{ py: 2 }} />
            );

          case 'raw':
            return <div key={i} dangerouslySetInnerHTML={{ __html: data.html }} />;
          case 'code':
            return <code>{data.code}</code>;
          default:
            break;
        }
        return null;
      })}
    </>
  );
  return htm;
};

export default parseEditorJsData;
