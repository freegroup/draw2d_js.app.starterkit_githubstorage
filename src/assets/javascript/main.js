// you are right - public vars are ugly...
//
var octo=null;
var repositories = null;
var githubToken = null;
var currentRepository = null;
var currentPath = "";
var currentSHA= null;
var canvas = null;

function initApp(){
    $('#splashDialog').modal('show');

    $(window).on("resize", function () {
        $("html, body").height($(window).height());
        $(".main, .menu").height($(window).height() - $(".header-panel").outerHeight());
        $(".pages").height($(window).height() - 50);
    }).trigger("resize");


    $("#connectToGithub").on("click",function(){
        githubToken = $("#githubToken").val();

        octo = new Octokat({
            token: githubToken
        });

        fetchRepositories();
        $('#githubConnectDialog').modal('hide');

    });

    $("#commitToGithub").on("click",function(){
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas,function(json, base64){
            var config = {
                message: $("#githubCommitMessage").val(),
                content: base64,
                sha: currentSHA
            };

            currentRepository.contents(currentPath).add(config)
                .then(function(info) {
                    currentSHA=  info.content.sha;
                    console.log(info);
                    $('#githubCommitDialog').modal('hide');
            });
        });

    });


    canvas = new draw2d.Canvas("gfx_holder");

    canvas.add( new draw2d.shape.basic.Oval(),100,100);
    canvas.add( new draw2d.shape.basic.Rectangle(),120,150);

    canvas.add( new draw2d.shape.node.Start(), 80,80);
    canvas.add( new draw2d.shape.node.Start(), 50,50);

    canvas.add( new draw2d.shape.node.End(), 150,150);
    canvas.add( new draw2d.shape.node.End(), 350,250);


    $.material.init();
}


function fetchPathContent( newPath ){
    currentRepository.contents(newPath).fetch(function(param, files){
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
        $.material.init();

        $(".githubPath[data-type='repository']").on("click", function(){
            fetchRepositories();
        });
        $(".githubPath[data-type='dir']").on("click", function(){
            fetchPathContent( $(this).data("path"));
        });
        $(".githubPath[data-type='file']").on("click", function(){
            currentPath =  $(this).data("path");
            currentSHA  =  $(this).data("sha");
            currentRepository.contents(currentPath).read(function(param, content){
                loadContent(content);
            });
        });
    });
}

function fetchRepositories(){
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
            '         <a href="#" class="list-group-item repository withripple text-nowrap" data-type="repository" data-path="{{currentPath}}" data-id="{{id}}">'+
            '         <small><span class="glyphicon mdi-content-archive"></span></small>'+
            '         {{{name}}}'+
            '         </a>'+
            '         {{/repos}}'
        );

        var output = compiled.render({
            currentPath: currentPath,
            repos: repos
        });
        $("#githubNavigation").html($(output));
        $.material.init();


        $(".repository").on("click", function(){
            var $this = $(this);
            var repositoryId = $this.data("id");
            currentRepository = $.grep(repositories, function(repo){return repo.id === repositoryId;})[0];
            fetchPathContent( $this.data("path"));
        });
    });

}


function loadContent(jsonString){
    console.log(currentSHA);
    canvas.clear();
    var reader = new draw2d.io.json.Reader();
    reader.unmarshal(canvas, jsonString);
    canvas.getCommandStack().markSaveLocation();
}






