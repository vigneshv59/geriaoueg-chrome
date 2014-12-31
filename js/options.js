function restore_options() {
    chrome.storage.sync.get("apertium-api-url", function(items) {
        if(items["apertium-api-url"]) {
            $("#apibox").val(items["apertium-api-url"])
        } else {
            restore_default_api_path()
        }
    });
}

function save_api_path() {
    chrome.storage.sync.set({'apertium-api-url': $("#apibox").val()}, function() {
        alert_msg = "Success!"
        $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
    });
}

function restore_default_api_path() {
    chrome.storage.sync.set({'apertium-api-url': "http://apy.projectjj.com/"}, function() {
        $("#apibox").val("http://apy.projectjj.com/")
    });
}

$("#submit").click( function() {
    save_api_path()
});

$("#restore-defaults").click( function() {
    restore_default_api_path()
});

$("#from-lang").change(function() {
    update_selectboxes()
    save_options()
});

$("#to-lang").change(function() {
    save_options()
});

$(document).ready(function() {
    restore_options()
});