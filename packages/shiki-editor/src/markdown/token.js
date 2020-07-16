export default class Token {
  constructor(type, content, children, attrs, direction, bbcode) {
    this.type = type;

    if (children) {
      this.children = children;
    }

    if (attrs) {
      this.attrs = attrs.constructor === Object ?
        Object.entries(attrs) :
        attrs;
    }

    if (content) {
      this.content = content;
    }

    if (direction) {
      this.direction = direction;
    }

    if (bbcode) {
      this.bbcode = bbcode;
    }
  }

  attrIndex(name) {
    let i;
    let len;

    if (!this.attrs) { return -1; }

    for (i = 0, len = this.attrs.length; i < len; i += 1) {
      if (this.attrs[i][0] === name) { return i; }
    }
    return -1;
  }

  attrPush(attrData) {
    if (this.attrs) {
      this.attrs.push(attrData);
    } else {
      this.attrs = [attrData];
    }
  }

  attrSet(name, value) {
    const idx = this.attrIndex(name);
    const attrData = [name, value];

    if (idx < 0) {
      this.attrPush(attrData);
    } else {
      this.attrs[idx] = attrData;
    }
  }

  attrGet(name) {
    const idx = this.attrIndex(name);
    let value = null;

    if (idx >= 0) {
      value = this.attrs[idx][1];
    }
    return value;
  }

  attrJoin(name, value) {
    const idx = this.attrIndex(name);

    if (idx < 0) {
      this.attrPush([name, value]);
    } else {
      this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
    }
  }

  serializeAttributes() {
    return this.attrs ? Object.fromEntries(this.attrs) : null;
  }
}
