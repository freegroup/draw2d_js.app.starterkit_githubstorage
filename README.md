# Use a Github Repository as your JSON backend

When writing a simple web app or prototyping something, you may want a quick and simple way to store, edit and retrieve data.

Let's say you write a simple editor for blog entries or a diagram editor done with a graph lib like draw2d and don't want to build a backend to write, edit and store your data - but you want to conveniently consume this data as JSON - then the Github API helps you with that.

Used libs (the usual suspects): 

- [jQuery](https://jquery.com/download/) as swiss army knife
- [Hogan.JS](http://twitter.github.io/hogan.js/) as template engine
- [Bootstrap](http://getbootstrap.com/) for the UI stuff
- [Bootstrap Material](https://fezvrasta.github.io/bootstrap-material-design/) as embellishment 
- [Draw2D](http://www.draw2d.org) as diagram lib 
- [OctokatJS](https://github.com/philschatz/octokat.js) Github API wrapper

all of the components above are installable via [Bower](http://bower.io/).

Project build job is done via [Grunt](http://gruntjs.com/)
 
At the end I'm absolute surprised how easy an WebApp can connect a repository via the GitHub API. Feel free to branch this repository.

See the small screen recoding below (github token isn't valid anymore :-) ) of the end result or use it direct [online](http://freegroup.github.io/draw2d_js.app.starterkit_githubstorage)


![Demo](https://raw.githubusercontent.com/freegroup/draw2d_js.app.starterkit_githubstorage/master/github.gif)
