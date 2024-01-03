(function($){
    $.fn.extend(
        {
            simpleAutoComplete: function( page, options, callback )
            {

                var thisElement = $(this);

                var searching = setTimeout(null,null);
                var formID = $(this).parent('form').attr('id');
                var preFunction = typeof(options.prefunction)=='function'
                    ? options.prefunction
                    : function(el){};

                if(typeof(page)=='undefined'){
                    alert('simpleAutoComplete: Page not found.');
                }

                var classAC = 'autocomplete';
                var selClass = 'btnblue';
                var attrCB = 'rel';

                var KEY = {
                    BACKSPACE: 8,
                    TAB: 9,
                    RETURN: 13,
                    ESC: 27,
                    LEFT: 37,
                    UP: 38,
                    RIGHT: 39,
                    DOWN: 40,
                    COMMA: 188,
                    DELETE: 46
                };

                $(':not(div.' + classAC + ')').on('click',function(){
                    $('div.' + classAC).remove();
                });

                preFunction(thisElement);

                thisElement.attr('autocomplete','off')
                    .focus(function(){
                        if($(this).val() != ''){
                            $(this).trigger('keydown');
                        }
                    })
                    .keydown(function( ev )
                    {
                        kc = ( ( typeof( ev.charCode ) == 'undefined' || ev.charCode === 0 ) ? ev.keyCode : ev.charCode );
                        var getOptions = { query: thisElement.val() };
                        classAC = typeof( options.autoCompleteClassName ) != 'undefined' ? options.autoCompleteClassName : classAC;
                        switch(kc){
                            case KEY.ESC:
                                $('div.' + classAC).remove();
                                thisElement.focus();
                                break;
                            case KEY.RETURN:
                                this.trigger('keyup');
                                break;
                            case KEY.TAB:
                                $('div.' + classAC + ' li:first').trigger('click');
                                break;
                            case KEY.UP:
                            case KEY.DOWN:
                                sel = false;
                                $('div.' + classAC + ' li').each(function(n, el)
                                {
                                    el = $(el);
                                    if ( !sel && el.hasClass(selClass) )
                                    {
                                        el.removeClass(selClass);
                                        $($('div.' + classAC + ' li a')[(kc == KEY.UP ? (n - 1) : (n + 1))]).addClass(selClass);
                                        sel = true;
                                    }
                                });
                                break;
                        }

                    })
                    .keyup(function( ev )
                    {
                        clearTimeout( searching );

                        searching = setTimeout(function(){
                            var getOptions = { query: thisElement.val() };

                            classAC = typeof( options.autoCompleteClassName ) != 'undefined' ? options.autoCompleteClassName : classAC;
                            selClass = typeof( options.selectedClassName ) != 'undefined' ? options.selectedClassName : selClass;

                            attrCB = typeof( options.attrCallBack ) != 'undefined' ? options.attrCallBack : attrCB;
                            getOptions.identifier = typeof( options.identifier ) == 'string' ? options.identifier : null;

                            if( typeof( options.extraParamFromInput ) != 'undefined' ){
                                getOptions.extraParam = $( options.extraParamFromInput ).val();
                            }
                            getOptions.queryStrLength = typeof( options.queryStrLength ) != 'undefined'
                                ? options.queryStrLength
                                : 2;

                            var otherParams = typeof(options.otherParams) == 'object'
                                ? $.extend({
                                    start : 0,
                                    records : 12
                                },options.otherParams)
                                : {
                                    start : 0,
                                    records : 12 ,
                                };
                            getOptions = $.extend(getOptions,otherParams);

                            kc = ( ( typeof( ev.charCode ) == 'undefined' || ev.charCode === 0 ) ? ev.keyCode : ev.charCode );
                            key = String.fromCharCode(kc);
                            $('div.' + classAC).remove();
                            if (key.match(/[a-zA-Z0-9_\\- ]/) || kc == KEY.BACKSPACE || kc == KEY.DELETE)
                            {
                                if (thisElement.val().length < getOptions.queryStrLength )
                                {
                                    $('div.' + classAC).remove();
                                }
                                else{
                                    $.post(page,getOptions,function(r)
                                        {
                                            $('div.' + classAC).remove();
                                            autoCompleteList = $('<div>').addClass(classAC).html(r);
                                            if (r != '')
                                            {
                                                autoCompleteList.insertAfter(thisElement);

                                                var position = thisElement.position();
                                                var height = thisElement.height();
                                                var width = thisElement.width();

                                                var leftmost = position.left - 50;

                                                $('div.' + classAC).css({
                                                    'top': ( height + position.top + 6 ) + 'px',
                                                    'left': ( leftmost > 0 ? leftmost : 0 )+'px',
                                                    'margin': '0px'
                                                });

                                                $('div.' + classAC + ' ul').css({
                                                    'margin-left': '0px'
                                                });

                                                $('div.' + classAC + ' li').each(function( n, el )
                                                {
                                                    el = $(el);
                                                    el.mouseenter(function(){
                                                        $('div.' + classAC + ' li a.' + selClass).removeClass(selClass);
                                                        $(this).children('a').addClass(selClass);
                                                    });
                                                    el.html().replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + getOptions.query + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<b>$1</b>');

                                                    el.bind('click',function()
                                                    {
                                                        thisElement.val(el.attr('thisid')).focus();
                                                        $('div.' + classAC).remove();
                                                        if( typeof( callback ) == 'function' ){
                                                            callback({
                                                                options : options,
                                                                thiselement : el,
                                                                thisid : el.attr('thisid'),
                                                                formElement : thisElement
                                                            });
                                                        }
                                                        else{
                                                            $('form#' + formID).submit();
                                                        }

                                                    });
                                                });
                                            }
                                        },'text'
                                    );
                                }
                            }
                        }, 750);

                    });
                return thisElement;
            }
        });
})(jQuery);
