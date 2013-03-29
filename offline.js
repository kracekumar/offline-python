$(function(){
    var worker = new Worker("js/worker.js");
    chrome.storage.local.set({"all-code": []});
    var init = function(){
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/python");
        editor.setFontSize(14);//set default font size to 14
        editor.commands.addCommand({
            name: 'Submit',
            bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'},
            exec: function(editor){
                var code = editor.getValue();
                chrome.storage.local.get("all-code", function(data){
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    chrome.storage.local.set({"all-code": [].concat(data["all-code"], code)});
                });
                evalPythonCode(code);
            }
        });

        editor.commands.addCommand({
            name: 'Enter',
            bindKey: {win: 'Enter', mac: 'Enter'},
            exec: function(editor){
                chrome.storage.local.set({"offline-python": editor.getValue()});
                editor.insert("\n");//hack insert a new line
            }
        });
        return editor;        
    };
    //update the output
    var  updateOutput= function(output){
            $(".output").append(output.data);
    };

    var evalPythonCode = function(code){
        worker.addEventListener('message', updateOutput, false);
        worker.postMessage(code);
      };

    var editor = init();
    chrome.storage.local.get("offline-python", function(data) {
        if (chrome.runtime.lastError) {
            return;
        }
        editor.setValue(data["offline-python"]);
    });

    //theme change
    $("#theme").on('change', function(){
        console.log($("#theme").val());
        editor.setTheme($("#theme").val());
    });

    //fontsize
    $("#fontsize").on("change", function(){
        console.log($("#fontsize").val());
        editor.setFontSize($("#fontsize").val());
    });

    //clear output
    $("#clear-output").on("click enter", function(){
        $(".output").html("");

    });
});