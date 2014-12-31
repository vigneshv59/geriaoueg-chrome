var alllangs = {}
var locales = {}

function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()
    chrome.storage.sync.set({'fr-lang': fr_lang, 'to-lang': to_lang}, function() {
        alert_msg = "Success! Reload pages for changes to take effect."
        // $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
    });
}

function restore_options() {
    chrome.storage.sync.get(["fr-lang", "to-lang"], function(items) {
        if (items["fr-lang"] && items["to-lang"]) {
            $("#to-lang").val(items["to-lang"])
            $("#from-lang").val(items["fr-lang"])
        }
        update_selectboxes()
    });
}

function download_langs_with_uri(api_uri) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URI(api_uri) + URI("listPairs"), false );
    xmlHttp.send(null);
    var langs = JSON.parse(xmlHttp.responseText);
    langs = langs["responseData"]
    var lang_codes = []
    
    $.each(langs, function(inx, rd){
        if (rd["sourceLanguage"] in alllangs) {
            alllangs[rd["sourceLanguage"]].push(rd["targetLanguage"])   
        } else {
            alllangs[rd["sourceLanguage"]] = [rd["targetLanguage"]]   
        }
        lang_codes.push(rd["sourceLanguage"])
        lang_codes.push(rd["targetLanguage"])
    });
    
    var codesstr = ""
    
    $.each(lang_codes, function(inx, code){
        codesstr = codesstr + code
        if (inx < lang_codes.length - 1) {
            codesstr = codesstr + "+"
        }
    });
    
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URI(api_uri) + URI("getLocale"), false );
    xmlHttp.send(null);
    var langlocale = JSON.parse(xmlHttp.responseText);
    langlocale = langlocale[0]
    
    langlocale = langlocale.split(/[-_]/)
    var reqUrl = URI.decode(URI(api_uri) + URI("listLanguageNames").addQuery("locale",langlocale[0]).addQuery("languages",codesstr))
    
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", reqUrl, false );
    xmlHttp.send(null);
    var localedict = JSON.parse(xmlHttp.responseText);
    locales = localedict
    
    var to_lang = {}
    $.each(Object.keys(alllangs), function(inx, lang) {
        var text_lang = locales[lang];
        if(!text_lang) {
            var lang_arr = lang.split("_")
            text_lang = locales[lang_arr[0]]
            if (!text_lang) {
                text_lang = lang
            } else {
                text_lang = text_lang + " " + lang_arr[1]
            }
        }
        
        $("#from-lang").append("<option value=\"" + lang + "\">" + text_lang + "</option>")
        $.each(alllangs[lang], function(ix, l) {
            if (!(l in to_lang)) {
                var to_text_lang = locales[l];
                if(!to_text_lang) {
                    var to_lang_arr = l.split("_")
                    to_text_lang = locales[to_lang_arr[0]]
                    if (!to_text_lang) {
                        to_text_lang = l
                    } else {
                        to_text_lang = to_text_lang + " " + to_lang_arr[1]
                    }
                }
                $("#to-lang").append("<option value=\"" + l + "\">" + to_text_lang + "</option>")
                to_lang[l] = 1
            }
        });
    });
    
    update_selectboxes();
}

function download_languages() {    
    chrome.storage.sync.get("apertium-api-url", function(items) {
        if (items["apertium-api-url"]) {
            download_langs_with_uri(items["apertium-api-url"])
        } else {
            download_langs_with_uri("http://apy.projectjj.com/")
        }
    });
}

function enable_disable() {
    chrome.storage.sync.get("apertium-enabled", function(items) {
        if(items["apertium-enabled"] == "On") {
            $("#enable-button").html("Off")
            chrome.storage.sync.set({'apertium-enabled': $("#enable-button").html()}, function() {
            });
        } else {
            $("#enable-button").html("On")
            chrome.storage.sync.set({'apertium-enabled': $("#enable-button").html()}, function() {
            });
        }
    });
}

function set_btn_txt() {
    chrome.storage.sync.get("apertium-enabled", function(items) {
        if(items["apertium-enabled"]) {
            $("#enable-button").html(items["apertium-enabled"])
        } else {
            $("#enable-button").html("On")
            chrome.storage.sync.set({'apertium-enabled': $("#enable-button").html()}, function() {
            });
        }
        if ($("#enable-button").html() == "On") {
            $("#enable-button").addClass('active')
        }
    });
}

function update_selectboxes() {
    $("#to-lang option").attr("disabled","disabled")
    
    $.each(alllangs[$("#from-lang").val()], function(inx, lang) {
        $("#to-lang option[value=\'" + lang + "\']").removeAttr('disabled');     
    });
    
    var new_list = $('#to-lang option[disabled!=\'disabled\']');    
    $.merge(new_list,$('#to-lang option[disabled=\'disabled\']'))
    $("#to-lang").empty().append(new_list);
    $("#to-lang").val($("#to-lang option[disabled!=\'disabled\']").val())
}

$("#from-lang").change(function() {
    update_selectboxes()
    save_options()
});

$("#to-lang").change(function() {
    save_options()
});

$("#enable-button").click( function() {
    enable_disable()
});

$(document).ready(function() {
    download_languages()
    restore_options()
    set_btn_txt()
});