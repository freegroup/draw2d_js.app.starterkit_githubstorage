var octo=null;
var repositories = null;
var githubToken = null;
var currentRepository = null;
var currentPath = "";

if(typeof String.prototype.endsWith ==="undefined") {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function dirname(path) {
  if(path.length===0)
    return "";

  var segments = path.split("/");
  if(segments.length<=1)
     return "";
  return segments.slice(0,-1).join("/");
}

function initApp(){

    $("#connectToGithub").on("click",function(){
        githubToken = $("#githubToken").val();

        octo = new Octokat({
            token: githubToken
        });

        fetchRepositories();
     });

    var canvas = new draw2d.Canvas("gfx_holder");

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
                return -1
            }
            return 1;
        });

        currentPath = newPath;
        var compiled = Hogan.compile(
            '         <li class="githubPath withripple" data-type="{{parentType}}" data-path="{{parentPath}}" >..</li>'+
            '         {{#files}}'+
            '         <li class="githubPath withripple text-nowrap" data-type="{{type}}" data-path="{{currentPath}}{{name}}" data-id="{{id}}">'+
            '                <small><span class="glyphicon {{icon}}"></span></small>'+
            '                {{{name}}}'+
            '         </li>'+
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
        $(".githubPath[data-type!='repository']").on("click", function(){
            fetchPathContent( $(this).data("path"));
        });
    })
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
            '         <li class="repository withripple text-nowrap" data-type="repository" data-path="{{currentPath}}" data-id="{{id}}">'+
            '         <small><span class="glyphicon mdi-content-archive"></span></small>'+
            '         {{{name}}}'+
            '         </li>'+
            '         {{/repos}}'
        );

        var output = compiled.render({
            currentPath: currentPath,
            repos: repos
        });
        $("#githubNavigation").html($(output));
        $.material.init();

        $('#githubConnectDialog').modal('hide');

        $(".repository").on("click", function(){
            var $this = $(this);
            var repositoryId = $this.data("id");
            currentRepository = $.grep(repositories, function(repo){return repo.id === repositoryId;})[0];
            fetchPathContent( $this.data("path"));
        });
    });

}