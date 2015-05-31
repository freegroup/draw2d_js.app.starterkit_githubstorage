/* jshint evil:true */

// you are right - public vars are ugly...
//
var octo=null;
var repositories = null;
var githubToken = null;
var currentRepository = null;
var currentPath = "";
var canvas = null;

var currentLoadedFile = null; // {sha:null, repository:null, path: null}

$(window).load(function () {
    $('#splashDialog').modal('show');

    $(window).on("resize", function () {
        var pageMargingTop  = parseInt($(".pages").css("top"));
        $("html, body").height($(window).height());
        $(".main, .menu").height($(window).height() - $(".header-panel").outerHeight());
        $(".pages").height($(window).height() - pageMargingTop);
    }).trigger("resize");


    // Button: Connect to GITHUB
    //
    $("#connectToGithub").on("click",function(){
        githubToken = $("#githubToken").val();

        octo = new Octokat({
            token: githubToken
        });

        fetchRepositories();
        $('#githubConnectDialog').modal('hide');
    });

    // Button: Commit to GitHub
    //
    $("#commitToGithub").on("click",function(){
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas,function(json, base64){
            var config = {
                message: $("#githubCommitMessage").val(),
                content: base64,
                sha: currentLoadedFile.sha
            };

            currentRepository.contents(currentLoadedFile.path).add(config)
                .then(function(info) {
                    currentLoadedFile.sha =  info.content.sha;
                    $('#githubCommitDialog').modal('hide');

                    // reload the directory display on the left hand side
                    // to show new new created file and the correct sha keys
                    //
                    fetchPathContent(dirname(info.content.path));
                    $('#githubNewFileDialog').modal('hide');
            });
        });
    });


    // Button: Create file on GitHub
    //
    $("#createOnGithub").on("click",function(){
        var writer = new draw2d.io.json.Writer();
        canvas.clear();
        writer.marshal(canvas,function(json, base64){
            var config = {
                message:"initial check in",
                content: base64
            };

            currentRepository.contents(currentPath+"/"+ $("#githubFileName").val()).add(config)
                .then(function(info) {
                    currentLoadedFile  =  {
                        sha    : info.content.sha,
                        path   : info.content.path,
                        content: json
                    };
                    // reload the directory display on the left hand side
                    // to show new new created file and the correct sha keys
                    //
                    fetchPathContent(dirname(info.content.path));
                    $('#githubNewFileDialog').modal('hide');
                });
        });
    });



    // init the Draw2D canvas
    //
    canvas = new draw2d.Canvas("gfx_holder");
    canvas.onDrop = function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var type = $(droppedDomNode).data("shape");
        var figure = eval("new "+type+"();");

        var randomColor=function(weight){
            return colors[Math.floor(Math.random()*colors.length)][weight];
        };
        figure.attr({
            bgColor: randomColor(300)
        });
        // create a command for the undo/redo support
        var command = new draw2d.command.CommandAdd(canvas, figure, x, y);
        canvas.getCommandStack().execute(command);
    };



    draw2d.Configuration.factory = $.extend({}, draw2d.Configuration.factory,{

        createResizeHandle: function(forShape, type){
            var handle= new draw2d.ResizeHandle(forShape, type);
            handle.attr({
                width:10,
                height:10,
                radius:4,
                bgColor:"#2196f3",
                stroke:0
            });

            handle.useGradient=false;

            return handle;
        },

        // @since 5.3.0
        createInputPort: function(relatedFigure){
            var p= new draw2d.InputPort({bgColor:"#ff9100", stroke:0});
            p.useGradient=false;
            return p;
        },
        // @since 5.3.0
        createOutputPort: function(relatedFigure){
            var p= new draw2d.OutputPort({bgColor:"#ff9100", stroke:0});
            p.useGradient=false;
            return p;
        },
        // @since 5.3.0
        createHybridPort: function(relatedFigure){
            var p= new draw2d.HybridPort({bgColor:"#ff9100", stroke:0});
            p.useGradient=false;
            return p;
        },

        createConnection : function( sourcePort, targetPort, callback, dropTarget){
            var conn = new RubberConnection();

            return conn;
        }
    });


    canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());

    // init the material Design theme
    //
    $.material.init();
});


function fetchPathContent( newPath ){
    currentRepository.contents(newPath).fetch(function(param, files){
        // sort the reusult
        // Directories are always on top
        //
        files.sort(function(a, b)
        {
            if(a.type===b.type) {
                if (a.name.toLowerCase() < b.name.toLowerCase())
                    return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase())
                    return 1;
                return 0;
            }
            if(a.type==="dir"){
                return -1;
            }
            return 1;
        });

        currentPath = newPath;
        var compiled = Hogan.compile(
            '         <a href="#" class="list-group-item githubPath withripple" data-type="{{parentType}}" data-path="{{parentPath}}" >'+
            '             <small><span class="glyphicon mdi-navigation-arrow-back"></span></small>'+
            '             ..'+
            '         </a>'+
            '         {{#files}}'+
            '           <a href="#" class="list-group-item githubPath withripple text-nowrap" data-type="{{type}}" data-path="{{currentPath}}{{name}}" data-id="{{id}}" data-sha="{{sha}}">'+
            '              <small><span class="glyphicon {{icon}}"></span></small>'+
            '              {{{name}}}'+
            '           </a>'+
            '         {{/files}}'
        );


        var parentPath =  dirname(newPath);
        var output = compiled.render({
            parentType: parentPath===newPath?"repository":"dir",
            parentPath: parentPath,
            currentPath: currentPath.length===0?currentPath:currentPath+"/",
            files: files,
            icon: function(){
                if(this.name.endsWith(".draw2d")){
                    return "mdi-editor-mode-edit";
                }
                return this.type==="dir"?"mdi-file-folder":"mdi-image-crop-portrait";
            }
        });
        $("#githubNavigation").html($(output));

        //we are in a folder. Create of a file is possible now
        //
        $("#newFileButton").show();

        $.material.init();

        $(".githubPath[data-type='repository']").on("click", function(){
            fetchRepositories();
        });

        $(".githubPath[data-type='dir']").on("click", function(){
            fetchPathContent( $(this).data("path"));
        });

        $(".githubPath[data-type='file']").on("click", function(){
            var path = $(this).data("path");
            var sha  = $(this).data("sha");
            currentRepository.contents(path).read(function(param, content){
                loadFile({
                    path : path,
                    sha  : sha,
                    content : content
                });
            });
        });
    });
}

function fetchRepositories(){
    // we need at least a folder to create a new file.
    //
    $("#newFileButton").hide();

    // fetch all repositories of the related user
    //
    octo.user.repos.fetch(function(param, repos){

        repos.sort(function(a, b)
        {
            if ( a.name.toLowerCase() < b.name.toLowerCase() )
                return -1;
            if ( a.name.toLowerCase() > b.name.toLowerCase() )
                return 1;
            return 0;
        });
        repositories = repos;
        var compiled = Hogan.compile(
            '         {{#repos}}'+
            '         <a href="#" class="list-group-item repository withripple text-nowrap" data-type="repository" data-id="{{id}}">'+
            '         <small><span class="glyphicon mdi-content-archive"></span></small>'+
            '         {{{name}}}'+
            '         </a>'+
            '         {{/repos}}'
        );

        var output = compiled.render({
            repos: repos
        });
        $("#githubNavigation").html($(output));
        $.material.init();


        $(".repository").on("click", function(){
            var $this = $(this);
            var repositoryId = $this.data("id");
            currentRepository = $.grep(repositories, function(repo){return repo.id === repositoryId;})[0];
            fetchPathContent("");
        });
    });

}

function loadFile(file){
    currentLoadedFile = file;
    canvas.clear();
    var reader = new draw2d.io.json.Reader();
    reader.unmarshal(canvas, file.content);
    canvas.getCommandStack().markSaveLocation();
    $("#githubCommmitButton").show();
}






