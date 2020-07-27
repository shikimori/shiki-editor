import fixUrl from '../../utils/fix_url';

export const LIST_DEPRECATION_TEXT =
  '[list] is deprecated, use [*] without wrapping in [list] tag';

export function parseCodeMeta(meta) {
  if (!meta) { return null; }

  return {
    language: meta
  };
}

export function parseDivMeta(meta) {
  if (!meta) { return null; }

  const attributes = {};

  const classes = [];
  const data = [];

  meta.split(' ').forEach(value => {
    if (value.length > 5 && value.startsWith('data-')) {
      const values = value.split('=');
      data.push([values[0], values[1] || '']);
    } else {
      classes.push(value);
    }
  });

  if (classes.length) {
    attributes.class = classes.join(' ');
  }
  if (data.length) {
    attributes.data = data;
  }

  return attributes;
}

export const IMAGE_META_REGEXP = /(?:c(?:lass)?=(?<css_class>[\w_-]+))|(?:(?<width>\d+)x(?<height>\d+))|(?:w(?:idth)?=(?<width2>\d+))|(?:h(?:eight)?=(?<height2>\d+))|(?<no_zoom>no-zoom)/;

export function parseImageMeta(meta) {
  if (!meta) { return null; }
  const attributes = {};
  const split = meta.split(' ');

  split.forEach(attribute => {
    const match = attribute.match(IMAGE_META_REGEXP);
    if (!match) { return; }

    if (match.groups.no_zoom) {
      attributes.isNoZoom = true;
    } else if (match.groups.width || match.groups.width2) {
      attributes.width = match.groups.width || match.groups.width2;
    } if (match.groups.height || match.groups.height2) {
      attributes.height = match.groups.height || match.groups.height2;
    } if (match.groups.css_class) {
      if (attributes.css_class) {
        attributes.class += ` ${match.groups.css_class}`;
      } else {
        attributes.class = match.groups.css_class;
      }
    }
  });

  return attributes;
}

export function parseLinkMeta(meta) {
  return {
    url: fixUrl(meta)
  };
}

export function parseQuoteMeta(meta) {
  if (!meta) { return null; }

  const attributes = {};
  const split = meta.split(';');

  if (split.length === 1) {
    attributes.nickname = split[0];
  } else {
    const id = split[0].slice(1);

    switch (split[0][0]) {
      case 'c':
        attributes.comment_id = parseInt(id);
        break;
      case 'm':
        attributes.message_id = parseInt(id);
        break;
      case 't':
        attributes.topic_id = parseInt(id);
        break;
    }

    attributes.user_id = parseInt(split[1]);
    attributes.nickname = split[2];
  }

  return attributes;
}

export function parseSizeMeta(meta) {
  return {
    size: meta
  };
}

export function parseSpoilerMeta(meta) {
  if (!meta) { return null; }

  return {
    label: meta
  };
}

export function parseShikiBasicMeta(bbcode, type, id, tagMeta) {
  const meta = {
    bbcode,
    type,
    id: parseInt(id)
  };

  if (tagMeta) {
    meta.meta = tagMeta;
  }

  return meta;
}
