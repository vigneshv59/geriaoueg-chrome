var curr_ev = null
var prev_x = -5
var prev_y = -5
var fr_x = 0
var to_x = 0
var escapeChars = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
 };
 

 
$("body").append("<div id = \"apertium-popup-translate\" class = \"apertium-popup-translate\"> <div id = \"apertium-popup-translate-text\" class = \"apertium-popup-translate-text\"> </div>")   

function real_movement(prex, prey, postx, posty) {
    if (Math.sqrt(Math.pow(prex-postx, 2) + Math.pow(prey-posty, 2)) >= 10) {
        return true;
    }
    return false;
}

function strip_leading_non_word_chars(s) {
    var desired_txt = XRegExp.replace(s,(XRegExp("^\\P{L}+")),"");
    desired_txt = XRegExp.replace(desired_txt,(XRegExp("\\P{L}+$")),"");
    return desired_txt;
}

$(document).mousemove(function(event) {
    if ((curr_ev) && (real_movement(prev_x, prev_y, event.pageX - window.pageXOffset, curr_ev.pageY - window.pageYOffset))) {
        $(".apertium-popup-translate").css("display","none")
    }
    curr_ev = event
});

function mouse_hover() {
    if (curr_ev) {

        var elem = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset));
            
        var nodes = elem.contents().filter(function(){
            return ((this.nodeType == Node.TEXT_NODE) && !($(this).text().match(/\A\s*\z/)))
        });

        $(nodes).wrap('<apertiumproblocation />');

        if (nodes.length == 0) {
            $(nodes).unwrap();
        } else {            
            var text = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
            if (text.nodeName == 'APERTIUMPROBLOCATION') { 
                $(nodes).unwrap();
                var txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var prev_txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var orig_text = $(txt).html();
                
                txt = $(txt).contents().filter(function(){
                    return this.nodeType == Node.TEXT_NODE && !($(this).text().match(/\A\s*\z/))
                });
                
                $.each(txt, function(inx, words) {
                    var wordarr = $(words).text().split(/([\s-;.])/g)
                    var dest_str = "" 
                    $.each(wordarr, function(inx, atext) {
                        dest_str = dest_str + "<apertiumword>" + htmlEscape(atext) + "</apertiumword>"
                    });
                    $(words).replaceWith(dest_str)
                    
                });
                
                
                
                $(".apertium-popup-translate-text").empty()
                
                var disp_txt_node = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset))
                
                $(prev_txt).empty()
                $(prev_txt).append(orig_text) 
                
                chrome.storage.sync.get(["apertium-api-url","fr-lang","to-lang"], function(items) {
                    if (items["apertium-api-url"]) {
                        if (items["fr-lang"] && items["to-lang"]) {
                            var disp_txt = translate_text(items["apertium-api-url"], disp_txt_node, (items["fr-lang"]+"-"+items["to-lang"]))
                        } else {
                            //Globalize!!
                            var disp_txt = "Please select a pair."
                        }
                    } else {
                        if (items["fr-lang"] && items["to-lang"]) {
                            var disp_txt = translate_text("http://apy.projectjj.com/", disp_txt_node, (items["fr-lang"]+"-"+items["to-lang"]))
                        } else {
                            //Globalize!!
                            var disp_txt = "Please select a pair."
                        }
                    }

                    if(shouldShow(disp_txt)) {
                        $(".apertium-popup-translate-text").append(disp_txt)
                        console.log()
                        $(".apertium-popup-translate").css("display","table")
                        var y_offset = 15
                        if ((curr_ev.pageY - window.pageYOffset + 40 + $(".apertium-popup-translate-text").outerHeight()) > $(window).height()) {
                            y_offset = -40
                        }
                    
                        var x_offset = 20
                    
                        if ((curr_ev.pageX + 70 + $(".apertium-popup-translate-text").outerWidth()) > $(window).width()) {
                            x_offset = -$(".apertium-popup-translate-text").outerWidth() + 20 - 60
                        }
                    
                        if ((curr_ev.pageX + x_offset) < 0) {
                            $(".apertium-popup-translate").css("left","5px")
                        } else {
                            $(".apertium-popup-translate").css("left",((curr_ev.pageX + x_offset).toString() + "px"))
                        }
                    
                        if ((curr_ev.pageY + y_offset) < 0) {
                            $(".apertium-popup-translate").css("top","5px")
                        } else {
                            $(".apertium-popup-translate").css("top",((curr_ev.pageY + y_offset).toString() + "px"))       
                        }
                    }
                
                    prev_x = curr_ev.pageX - window.pageXOffset
                    prev_y = curr_ev.pageY - window.pageYOffset
    
                });
                // disp_txt = XRegExp.replace(disp_txt, new XRegExp("\\P{L}+", "g"), "")                               
            } else {
                $(nodes).unwrap();                
            }
        }   
    }
}

function translate_text(apy_url, txt_node, lang_pair) {
    var ctx_counter = 0
    var ctx_pos = 1
    var desired_txt = strip_leading_non_word_chars(txt_node.text().trim())
    var curr_node = txt_node 
    var txt = txt_node.text()
    while ((ctx_counter < 14) && (curr_node.prev().length != 0)) {
        txt = curr_node.prev().text() + txt
        if(XRegExp("\\p{L}").test(curr_node.prev().text())) {
            ctx_counter = ctx_counter + 1
            if(desired_txt == strip_leading_non_word_chars(curr_node.prev().text().trim())) {
                ctx_pos = ctx_pos + 1
            }
        }
        curr_node = curr_node.prev()
        
    }    
    
    ctx_counter = 0
    
    while ((ctx_counter < 14) && (curr_node.next().length != 0)) {
        txt = txt + curr_node.next().text()
        if(XRegExp("\\p{L}").test(curr_node.next().text())) {
            ctx_counter = ctx_counter + 1
        }
        curr_node = curr_node.next()  
    } 
    
    txt = XRegExp.replace(txt,XRegExp("\\s"),"+")
    var reqUrl = encodeSemicolon(URI.decode(URI(apy_url) + URI("perWord").addQuery("lang",lang_pair).addQuery("modes","biltrans").addQuery("q",txt)))

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", encodeURI(reqUrl), false );
    xmlHttp.send(null);
    var lang_arr = JSON.parse(xmlHttp.responseText);
    var first_time = true
    //Globalize!!
    var translated_txt = "Sorry, we cannot translate \"" + desired_txt + "\""
    $.each(lang_arr, function(inx, trans_obj) {
        if(trans_obj.input == desired_txt) {
            if(ctx_pos == 1) {
                $.each(trans_obj.biltrans, function(inx, btransobj) {
                    if(first_time) {
                        if(actualEntry(htmlEscape(btransobj))){
                            word_tags = getTags(btransobj)
                            var tags_str = ""
                            $.each(word_tags, function(inx, word_tag) {
                                tags_str += word_tag
                                if (inx < (word_tags.length - 1)) {
                                    tags_str += ", "
                                }
                            })
                            translated_txt = "<li>" + stripTags(htmlEscape(btransobj))
                            if(tags_str != "") {
                                translated_txt += " (" + tags_str + ")"+"</li>" 
                            } else {
                                translated_txt += "</li>" 
                            }
                            first_time = false
                        }
                    } else {
                        if(actualEntry(htmlEscape(btransobj))){
                            word_tags = getTags(btransobj)
                            var tags_str = ""
                            $.each(word_tags, function(inx, word_tag) {
                                tags_str += word_tag
                                if (inx < (word_tags.length - 1)) {
                                    tags_str += ", "
                                }
                            })
                            
                            translated_txt += "<li>" + stripTags(htmlEscape(btransobj))
                            if(tags_str != "") {
                                translated_txt += " (" + tags_str + ")"+"</li>" 
                            } else {
                                translated_txt += "</li>" 
                            }
                        }
                    }
                })
                return false;
            } else {
                ctx_pos = ctx_pos - 1;
            }
        } 
    });
    return translated_txt
}

$(document).mousestop(function() {
    chrome.storage.sync.get("apertium-enabled", function(items) {
        if(items["apertium-enabled"]) {
            if(items["apertium-enabled"] == "On") {
                mouse_hover()
            }
        } else {
            chrome.storage.sync.set({'apertium-enabled': "On"}, function() {
                mouse_hover()
            });
        }
    });
});

function htmlEscape(string) {
    return String(string).replace(/[&<>]/g, function (s) {
      return escapeChars[s];
    });
  }
  
function encodeSemicolon(string) {
    return String(string.replace(/;/g), "%3B") 
}

function getTags(string) {
    regex = /<(.*?)>/g
    word_tags = []
    tag_match = regex.exec(string)
    if(tag_match) {
        word_tags.push(tag_match[1])
    }
    while(tag_match) {
        tag_match = regex.exec(string)
        if(tag_match) {
            word_tags.push(tag_match[1])
        }
    }
    return word_tags
}

function stripTags(string){
    return String(string.replace(/&lt;.*$/, ""))
}
//I think this works ... Someone should check this logic against the format of the APY.
function actualEntry(string) {
    if (XRegExp.test(string.trim(), XRegExp("@\\p{L}"))) {
        return false;
    } else {
        return true;
    }
} 

function shouldShow(string) {
    return XRegExp.test(string.trim(), XRegExp("\\p{L}"))
}