var alllangs = {}

function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()
    chrome.storage.sync.set({'fr-lang': fr_lang, 'to-lang': to_lang}, function() {
        // Update status to let user know options were saved.
        // Should this be there? $("#alert-area").empty()
        $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>Success!</div>")
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
    $.each(langs, function(inx, rd){
        if (rd["sourceLanguage"] in alllangs) {
            alllangs[rd["sourceLanguage"]].push(rd["targetLanguage"])   
        } else {
            alllangs[rd["sourceLanguage"]] = [rd["targetLanguage"]]   
        }
    });
    
    var to_lang = {}
    $.each(Object.keys(alllangs), function(inx, lang) {
        $("#from-lang").append("<option value=\"" + lang + "\">" + lang + "</option>")
        $.each(alllangs[lang], function(ix, l) {
            if (!(l in to_lang)) {
                $("#to-lang").append("<option value=\"" + l + "\">" + l + "</option>")
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