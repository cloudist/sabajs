// SabaJS JavaScript Library.
//
// Copyright (c) 2015 Cloudist Technology Co., Ltd.
// Released under the MIT license
//
// Author: lishuo@cloudist.cc

(function () {

        var B, classList, classCache = {};

        function isFunction(value) {
            return typeof value == "function"
        }

        function isObject(obj) {
            return typeof obj === "object"
        }

        function funcArg(context, arg, idx, payload) {
            return isFunction(arg) ? arg.call(context, idx, payload) : arg
        }

        function className(node, value) {
            var klass = node.className || '',
                svg = klass && klass.baseVal !== undefined;

            if (value === undefined) return svg ? klass.baseVal : klass;
            svg ? (klass.baseVal = value) : (node.className = value)
        }

        function classRE(name) {
            return name in classCache ?
                classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
        }

        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
        }

        function getXMLHttpRequest() {
            if (window.ActiveXObject) {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            throw new Error('Cannot create XML HTTP request');
        }

        function addEvent(obj, type, fn) {
            if (obj.attachEvent) {
                obj['e' + type + fn] = fn;
                obj[type + fn] = function () {
                    obj['e' + type + fn](window.event);
                };
                obj.attachEvent('on' + type, obj[type + fn]);
            } else
                obj.addEventListener(type, fn, false);
        }

        function removeEvent(obj, type, fn) {
            if (obj.detachEvent) {
                obj.detachEvent('on' + type, obj[type + fn]);
                obj[type + fn] = null;
            } else
                obj.removeEventListener(type, fn, false);
        }

        // Create a safe reference to the object for use below.
        var base = function (obj) {
            if (obj instanceof base) return obj;
            if (!(this instanceof base)) return new base(obj);
            this._wrapped = obj;
        };

        base.VERSION = '0.0.1';

        /*!
         * @preserve Qwery - A Blazing Fast query selector engine
         * https://github.com/ded/qwery
         * copyright Dustin Diaz 2012
         * MIT License
         * 3.4.2
         */
        var Qwery = (function () {
            var doc = document
                , html = doc.documentElement
                , byClass = 'getElementsByClassName'
                , byTag = 'getElementsByTagName'
                , qSA = 'querySelectorAll'
                , useNativeQSA = 'useNativeQSA'
                , tagName = 'tagName'
                , nodeType = 'nodeType'
                , select // main select() method, assign later

                , id = /#([\w\-]+)/
                , clas = /\.[\w\-]+/g
                , idOnly = /^#([\w\-]+)$/
                , classOnly = /^\.([\w\-]+)$/
                , tagOnly = /^([\w\-]+)$/
                , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
                , splittable = /(^|,)\s*[>~+]/
                , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
                , splitters = /[\s\>\+\~]/
                , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
                , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
                , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
                , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
                , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
                , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
                , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
                , tokenizr = new RegExp(splitters.source + splittersMore.source)
                , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

            var walker = {
                ' ': function (node) {
                    return node && node !== html && node.parentNode
                }
                , '>': function (node, contestant) {
                    return node && node.parentNode == contestant.parentNode && node.parentNode
                }
                , '~': function (node) {
                    return node && node.previousSibling
                }
                , '+': function (node, contestant, p1, p2) {
                    if (!node) return false
                    return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
                }
            }

            function cache() {
                this.c = {}
            }

            cache.prototype = {
                g: function (k) {
                    return this.c[k] || undefined
                }
                , s: function (k, v, r) {
                    v = r ? new RegExp(v) : v
                    return (this.c[k] = v)
                }
            }

            var classCache = new cache()
                , cleanCache = new cache()
                , attrCache = new cache()
                , tokenCache = new cache()

            function classRegex(c) {
                return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
            }

            // not quite as fast as inline loops in older browsers so don't use liberally
            function each(a, fn) {
                var i = 0, l = a.length
                for (; i < l; i++) fn(a[i])
            }

            function flatten(ar) {
                for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
                return r
            }

            function arrayify(ar) {
                var i = 0, l = ar.length, r = []
                for (; i < l; i++) r[i] = ar[i]
                return r
            }

            function previous(n) {
                while (n = n.previousSibling) if (n[nodeType] == 1) break;
                return n
            }

            function q(query) {
                return query.match(chunker)
            }

            // called using `this` as element and arguments from regex group results.
            // given => div.hello[title="world"]:foo('bar')
            // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
            function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
                var i, m, k, o, classes
                if (this[nodeType] !== 1) return false
                if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
                if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
                if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
                    for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
                }
                if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
                if (wholeAttribute && !value) { // select is just for existance of attrib
                    o = this.attributes
                    for (k in o) {
                        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
                            return this
                        }
                    }
                }
                if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
                    // select is for attrib equality
                    return false
                }
                return this
            }

            function clean(s) {
                return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
            }

            function checkAttr(qualify, actual, val) {
                switch (qualify) {
                    case '=':
                        return actual == val
                    case '^=':
                        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
                    case '$=':
                        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
                    case '*=':
                        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
                    case '~=':
                        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
                    case '|=':
                        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
                }
                return 0
            }

            // given a selector, first check for simple cases then collect all base candidate matches and filter
            function _qwery(selector, _root) {
                var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
                    , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
                    , dividedTokens = selector.match(dividers)

                if (!tokens.length) return r

                token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
                if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
                if (!root) return r

                intr = q(token)
                // collect base candidates to filter
                els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
                    function (r) {
                        while (root = root.nextSibling) {
                            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
                        }
                        return r
                    }([]) :
                    root[byTag](intr[1] || '*')
                // filter elements according to the right-most part of the selector
                for (i = 0, l = els.length; i < l; i++) {
                    if (item = interpret.apply(els[i], intr)) r[r.length] = item
                }
                if (!tokens.length) return r

                // filter further according to the rest of the selector (the left side)
                each(r, function (e) {
                    if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e
                })
                return ret
            }

            // compare element to a selector
            function is(el, selector, root) {
                if (isNode(selector)) return el == selector
                if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

                var selectors = selector.split(','), tokens, dividedTokens
                while (selector = selectors.pop()) {
                    tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
                    dividedTokens = selector.match(dividers)
                    tokens = tokens.slice(0) // copy array
                    if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
                        return true
                    }
                }
                return false
            }

            // given elements matching the right-most part of a selector, filter out any that don't match the rest
            function ancestorMatch(el, tokens, dividedTokens, root) {
                var cand
                // recursively work backwards through the tokens and up the dom, covering all options
                function crawl(e, i, p) {
                    while (p = walker[dividedTokens[i]](p, e)) {
                        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
                            if (i) {
                                if (cand = crawl(p, i - 1, p)) return cand
                            } else return p
                        }
                    }
                }

                return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
            }

            function isNode(el, t) {
                return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
            }

            function uniq(ar) {
                var a = [], i, j;
                o:
                    for (i = 0; i < ar.length; ++i) {
                        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
                        a[a.length] = ar[i]
                    }
                return a
            }

            function arrayLike(o) {
                return (typeof o === 'object' && isFinite(o.length))
            }

            function normalizeRoot(root) {
                if (!root) return doc
                if (typeof root == 'string') return qwery(root)[0]
                if (!root[nodeType] && arrayLike(root)) return root[0]
                return root
            }

            function byId(root, id, el) {
                // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
                return root[nodeType] === 9 ? root.getElementById(id) :
                root.ownerDocument &&
                (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
                (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
            }

            function qwery(selector, _root) {
                var m, el, root = normalizeRoot(_root)

                // easy, fast cases that we can dispatch with simple DOM calls
                if (!root || !selector) return []
                if (selector === window || isNode(selector)) {
                    return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
                }
                if (selector && arrayLike(selector)) return flatten(selector)
                if (m = selector.match(easy)) {
                    if (m[1]) return (el = byId(root, m[1])) ? [el] : []
                    if (m[2]) return arrayify(root[byTag](m[2]))
                    if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
                }

                return select(selector, root)
            }

            // where the root is not document and a relationship selector is first we have to
            // do some awkward adjustments to get it to work, even with qSA
            function collectSelector(root, collector) {
                return function (s) {
                    var oid, nid
                    if (splittable.test(s)) {
                        if (root[nodeType] !== 9) {
                            // make sure the el has an id, rewrite the query, set root to doc and run it
                            if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
                            s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
                            collector(root.parentNode || root, s, true)
                            oid || root.removeAttribute('id')
                        }
                        return;
                    }
                    s.length && collector(root, s, false)
                }
            }

            var isAncestor = 'compareDocumentPosition' in html ?
                    function (element, container) {
                        return (container.compareDocumentPosition(element) & 16) == 16
                    } : 'contains' in html ?
                    function (element, container) {
                        container = container[nodeType] === 9 || container == window ? html : container
                        return container !== element && container.contains(element)
                    } :
                    function (element, container) {
                        while (element = element.parentNode) if (element === container) return 1
                        return 0
                    }
                , getAttr = function () {
                    // detect buggy IE src/href getAttribute() call
                    var e = doc.createElement('p')
                    return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
                        function (e, a) {
                            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
                                e.getAttribute(a, 2) : e.getAttribute(a)
                        } :
                        function (e, a) {
                            return e.getAttribute(a)
                        }
                }()
                , hasByClass = !!doc[byClass]
            // has native qSA support
                , hasQSA = doc.querySelector && doc[qSA]
            // use native qSA
                , selectQSA = function (selector, root) {
                    var result = [], ss, e
                    try {
                        if (root[nodeType] === 9 || !splittable.test(selector)) {
                            // most work is done right here, defer to qSA
                            return arrayify(root[qSA](selector))
                        }
                        // special case where we need the services of `collectSelector()`
                        each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
                            e = ctx[qSA](s)
                            if (e.length == 1) result[result.length] = e.item(0)
                            else if (e.length) result = result.concat(arrayify(e))
                        }))
                        return ss.length > 1 && result.length > 1 ? uniq(result) : result
                    } catch (ex) {
                    }
                    return selectNonNative(selector, root)
                }
            // no native selector support
                , selectNonNative = function (selector, root) {
                    var result = [], items, m, i, l, r, ss
                    selector = selector.replace(normalizr, '$1')
                    if (m = selector.match(tagAndOrClass)) {
                        r = classRegex(m[2])
                        items = root[byTag](m[1] || '*')
                        for (i = 0, l = items.length; i < l; i++) {
                            if (r.test(items[i].className)) result[result.length] = items[i]
                        }
                        return result
                    }
                    // more complex selector, get `_qwery()` to do the work for us
                    each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
                        r = _qwery(s, ctx)
                        for (i = 0, l = r.length; i < l; i++) {
                            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
                        }
                    }))
                    return ss.length > 1 && result.length > 1 ? uniq(result) : result
                }
                , configure = function (options) {
                    // configNativeQSA: use fully-internal selector or native qSA where present
                    if (typeof options[useNativeQSA] !== 'undefined')
                        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
                }

            configure({useNativeQSA: true})

            qwery.configure = configure
            qwery.uniq = uniq
            qwery.is = is
            qwery.pseudos = {}

            return qwery
        })();

        base.el = function (queryString) {
            return B(queryString);
        };

        /**
         * Ajax
         */
        var Ajax = {
            request: function (ops) {
                if (typeof ops == 'string') ops = {url: ops};
                ops.url = ops.url || '';
                ops.method = ops.method || 'get';
                ops.data = ops.data || {};
                var getParams = function (data, url) {
                    var arr = [], str;
                    for (var name in data) {
                        arr.push(name + '=' + encodeURIComponent(data[name]));
                    }
                    str = arr.join('&');
                    if (str != '') {
                        return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
                    }
                    return '';
                };
                var api = {
                    host: {},
                    process: function (ops) {
                        var self = this;

                        this.xhr = getXMLHttpRequest();
                        this.xhr.onreadystatechange = function () {
                            if (self.xhr.readyState == 4 && self.xhr.status == 200) {
                                var result = self.xhr.responseText;
                                if (ops.json === true && typeof JSON != 'undefined') {
                                    result = JSON.parse(result);
                                }
                                self.doneCallback && self.doneCallback.apply(self.host, [result, self.xhr]);
                            } else if (self.xhr.readyState == 4) {
                                self.failCallback && self.failCallback.apply(self.host, [self.xhr]);
                            }
                            self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.xhr]);
                        }

                        if (ops.method == 'get') {
                            this.xhr.open('GET', ops.url + getParams(ops.data, ops.url), true);
                        } else {
                            this.xhr.open(ops.method, ops.url, true);
                            this.setHeaders({
                                'X-Requested-With': 'XMLHttpRequest',
                                'Content-type': 'application/x-www-form-urlencoded'
                            });
                        }
                        if (ops.headers && typeof ops.headers == 'object') {
                            this.setHeaders(ops.headers);
                        }

                        setTimeout(function () {
                            ops.method === 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data));
                        }, 20);
                        return this;
                    },
                    done: function (callback) {
                        this.doneCallback = callback;
                        return this;
                    },
                    fail: function (callback) {
                        this.failCallback = callback;
                        return this;
                    },
                    always: function (callback) {
                        this.alwaysCallback = callback;
                        return this;
                    },
                    setHeaders: function (headers) {
                        for (var name in headers) {
                            this.xhr.setRequestHeader(name, headers[name]);
                        }
                    }
                };
                return api.process(ops);
            }
        };

        base.ajax = Ajax.request;

        /**
         * Functions
         */
        B = function (selector) {
            var dom = Qwery(selector);
            dom.html = B.fn.html;
            dom.each = B.fn.each;
            dom.empty = B.fn.empty;
            dom.addClass = B.fn.addClass;
            dom.hasClass = B.fn.hasClass;
            dom.removeClass = B.fn.removeClass;
            dom.trim = B.fn.trim;
            dom.val = B.fn.val;
            dom.on = B.fn.on;
            dom.off = B.fn.off;
            dom.attr = B.fn.attr;
            dom.removeAttr = B.fn.removeAttr;
            dom.text = B.fn.text;
            return dom;
        };

        // Define methods that will be available on all
        B.fn = {
            trim: function (text) {
                var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
                return text == null ? "" : ( text + "" ).replace(rtrim, "");
            },
            each: function (callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i])
                }
                return this
            },
            empty: function () {
                return this.each(function () {
                    this.innerHTML = ''
                })
            },
            html: function (html) {
                return 0 in arguments ?
                    this.each(function (idx) {
                        var originHtml = this.innerHTML;
                        B(this).empty();
                        this.innerHTML = funcArg(this, html, idx, originHtml)
                    }) :
                    (0 in this ? this[0].innerHTML : null)
            },
            val: function (value) {
                return 0 in arguments ?
                    this.each(function (idx) {
                        this.value = funcArg(this, value, idx, this.value)
                    }) :
                    (this[0] && (this[0].multiple ?
                            B(this[0]).find('option').filter(function () {
                                return this.selected
                            }).pluck('value') :
                            this[0].value)
                    )
            },
            hasClass: function (selector) {

                var rclass = /[\t\r\n\f]/g;
                if (!selector) return false;

                var className = " " + selector + " ",
                    i = 0,
                    l = this.length;
                for (; i < l; i++) {
                    if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
                        return true;
                    }
                }

                return false;
            },
            addClass: function (name) {
                if (!name) return this;
                return this.each(function (idx) {
                    if (!('className' in this)) return;
                    classList = [];
                    var cls = className(this), newName = funcArg(this, name, idx, cls);

                    var names = newName.split(/\s+/g);
                    for (var i = 0; i < names.length; i++) {
                        if (!B.fn.hasClass(names[i])) classList.push(names[i])
                    }
                    classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
                })
            },
            removeClass: function (name) {
                return this.each(function (idx) {
                    if (!('className' in this)) return;
                    if (name === undefined) return className(this, '');
                    classList = className(this);
                    var names = funcArg(this, name, idx, classList).split(/\s+/g);
                    for (var i = 0; i < names.length; i++) {
                        classList = classList.replace(classRE(names[i]), " ")
                    }
                    className(this, B.fn.trim(classList));
                })
            },
            attr: function (name, value) {
                var result;
                return (typeof name == 'string' && !(1 in arguments)) ?
                    (!this.length || this[0].nodeType !== 1 ? undefined :
                            (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                    ) :
                    this.each(function (idx) {
                        if (this.nodeType !== 1) return
                        if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
                        else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                    })
            },
            removeAttr: function (name) {
                return this.each(function () {
                    this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                        setAttribute(this, attribute)
                    }, this)
                })
            },
            on: function (event, fn) {
                return this.each(function (index, el) {
                    addEvent(el, event, fn);
                }, this)
            },
            off: function (event, fn) {
                return this.each(function (index, el) {
                    removeEvent(el, event, fn);
                }, this)
            },
            text: function (text) {
                return text !== undefined ?
                    this.each(function (idx) {
                        var newText = text;
                        this.textContent = this.innerText = newText;
                    }) :
                    (0 in this ? this[0].textContent || this[0].innerText : null)
            }
        };

        // Establish the root object
        var root = this;
        root._ = base;

    }.call(this)
);
