# SabaJS

![SabaJS](vendor/icon.png)

SabaJS is a light-weight cross-platform JavaScript library that provides some frequently used functions.

Insipred by Qwery and Underscore.

> saba: 青花鱼  
> 作者 Tomi 在居酒屋做兼职，那里的烤青花鱼是我们的最爱。


## Browser Support

-   IE 6+
-   Chrome 1+
-   Safari 3+
-   Firefox 4+


## API

### AJAX

**Usage:**

    _.ajax({options})

**Example:**

    _.ajax({
      url: URL,
      method: 'get'
    }).fail(function (xhr) {
      // do with xhr
    }).done(function (data) {
      // do with data
    });

**Options:**

    url: URL string
    method: HTTP method ['get', 'post']
    headers: HTTP headers
    data: HTTP request data
    json: boolean, trigger JSON response wrapping

### Element Selector

**Usage:**

    _.el(selector)

**Selector Support:**

    /* basic */
    #foo {} /* id */
    .bar {} /* class */
    a#foo.bar {} /* element attribute combinations */

    /* attributes */
    #foo a[href] {} /* simple */
    #foo a[href=bar] {} /* attribute values */
    #foo a[lang|=en] {} /* subcodes */
    #foo a[title~=hello] {} /* attribute contains */
    #foo a[href^="http://"] {} /* attribute starts with */
    #foo a[href$=com] {} /* attribute ends with */
    #foo a[href*=twitter] /* {} attribute wildcards */

    /* descendants */
    #foo a {} /* all descendants */
    ul#list > li {} /* direct children */

    /* siblings */
    span ~ strong {} /* all adjacent */
    p + p {} /* immediate adjacent */

    /* combos */
    div,p {}

    /* variations */
    #foo.bar.baz {}
    div#baz.thunk a[-data-info*="hello world"] span + strong {}
    #thunk[title$='huzza'] {}

### Element Methods

#### html

**\_.el(selector).html([HTML])**

return the inner HTML of element or set the element's HTML

**Returns:**

With HTML argument: will return a string.  
Without HTML argument will return None.

**Example:**

    _.el(selector).html()
    => return the html of the selected element or the first elements selected.

    _.el(selector).html(HTML_String)
    => set the innerHTML to the specified HTML string.


#### each

**\_.el(selector).each( callback(index, item ) )**


**Returns:**

None

**Example:**

    _.el(selector).each(function(index, item){
      console.log(item);
    })

#### empty

**\_.el(selector).empty()**

empty the content of selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).empty()
    => _.el(selector).html() === '' -> true


#### addClass

**\_.el(selector).addClass(className)**

add a class to the selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).addClass('active')
    => _.el(selector).hasClass('active') -> true


#### hasClass

**\_.el(selector).hasClass(className)**

add a class to the selected element(s).

**Returns:**

Boolean

**Example:**

    _.el(selector).addClass('active')
    => _.el(selector).hasClass('active') -> true



#### removeClass

**\_.el(selector).removeClass(className)**

remove a class from the selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).addClass('active')
    => _.el(selector).hasClass('active') -> true
    _.el(selector).removeClass('active')
    => _.el(selector).hasClass('active') -> false



#### val

**\_.el(selector).val([value])**

get the value of selected element(s).
or set the value to selected element(s).

**Returns:**

With value argument: will return a string that is the value of the selected element(s).  
Without value argument: None.

**Example:**

    console.log(_.el(selector).val());

    _.el(selector).val('some value')
    => _.el(selector).val() === 'some value' -> true

#### text

**\_.el(selector).text([text])**

set the text content of the selected element(s).
or get the text content of selected element(s).

**Returns:**

With text argument: None.  
Without text argument: String of text content.

**Example:**

    console.log(_.el(selector).text());

    _.el(selector).text('some text')
    => _.el(selector).text() === 'some text' -> true

#### on

**\_.el(selector).on( event, callback )**

add a event listener to selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).on('click', function() { alert('clicked') });

#### off

**\_.el(selector).on( event, callback )**

remove a event listener from selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).off('click', function() { alert('clicked') });


#### attr

**\_.el(selector).attr( name, [value] )**

set the attribute to the selected element(s).
or get the attribute value from selected element(s)

**Returns:**

None

**Example:**

    _.el(selector).attr('id', 'someThing');
    _.el(selector).attr('id') === 'someThing' => true;


#### removeAttr

**\_.el(selector).removeAttr( name )**

remove an attribute from the selected element(s).

**Returns:**

None

**Example:**

    _.el(selector).attr('id', 'someThing');
    _.el(selector).attr('id') === 'someThing' => true;

    _.el(selector).removeAttr('id');
    _.el(selector).attr('id') === undefined => true;
