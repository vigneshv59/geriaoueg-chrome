var curr_ev = 'null'
 
$("body").append("<div id = \"apertium-popup-translate\" class = \"apertium-popup-translate\"> <div id = \"apertium-popup-translate-text\" class = \"apertium-popup-translate-text\"> </div>")   
    
$(document).mousemove(function(event) {
    curr_ev = event
});

$(document).mousestop(function() {
    if (curr_ev != 'null') {

        var elem = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset));
            
        var nodes = elem.contents().filter(function(){
            return this.nodeType == Node.TEXT_NODE
        });

        $(nodes).wrap('<apertiumnode />');

        if (nodes.length == 0) {
            $(nodes).unwrap();
        } else {
            var text = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
            if (text.nodeName == 'APERTIUMNODE') {                
                var orig_text = $(text).text();
                var words = $(text).text().split(/( )/);
                
                
                $(text).empty();
                $.each(words, function(k, i) {
                    $(text).append($("<apertiumword />").text(i));
                });
                
                $(".apertium-popup-translate-text").empty()
                
                var disp_txt = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset)).text()
                // console.log(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset).contents())
                    
                $(".apertium-popup-translate-text").append(disp_txt)
                $(".apertium-popup-translate").css("display","table")
                $(".apertium-popup-translate").css("left",((curr_ev.pageX + 20).toString() + "px"))
                $(".apertium-popup-translate").css("top",((curr_ev.pageY + 15).toString() + "px"))
                
                $(text).empty()
                $(text).append(orig_text)  
                k = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset)
                $(k).contents().unwrap();                
                              
            }
        }   
    }
});

