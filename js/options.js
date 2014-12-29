var alllangs = {}
var locales = {}

function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()
    chrome.storage.sync.set({'fr-lang': fr_lang, 'to-lang': to_lang}, function() {
        alert_msg = "Success! Reload pages for changes to take effect."
        $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
    });
}

function restore_options() {
    chrome.storage.sync.get(["fr-lang", "to-lang"], function(items) {
        if (items["fr-lang"] && items["to-lang"]) {
            $("#to-lang").val(items["to-lang"])
            $("#from-lang").val(items["fr-lang"])
        }
    });
}

function download_languages() {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "http://apy.projectjj.com/listPairs", false );
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
    
    var reqUrl = "http://apy.projectjj.com/listLanguageNames?locale=en&languages="
    
    $.each(lang_codes, function(inx, code){
        reqUrl = reqUrl + code
        if (inx < lang_codes.length - 1) {
            reqUrl = reqUrl + "+"
        }
    });
    
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
            text_lang = text_lang + " " + lang_arr[1]
        }
        
        $("#from-lang").append("<option value=\"" + lang + "\">" + text_lang + "</option>")
        $.each(alllangs[lang], function(ix, l) {
            if (!(l in to_lang)) {
                var to_text_lang = locales[l];
                if(!to_text_lang) {
                    var to_lang_arr = l.split("_")
                    to_text_lang = locales[to_lang_arr[0]]
                    to_text_lang = to_text_lang + " " + to_lang_arr[1]
                }
                $("#to-lang").append("<option value=\"" + l + "\">" + to_text_lang + "</option>")
                to_lang[l] = 1
            }
        });
    });
    
    update_selectboxes();
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

$("#submit").click( function() {
    save_options()
});

$("#from-lang").change(function() {
    update_selectboxes()
});

$(document).ready(function() {
    restore_options()
    download_languages()
});