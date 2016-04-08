var fs = require('fs');
var htmlencode = require('htmlencode').htmlEncode;

var KelmuEditor = function() {};

KelmuEditor.register = function(handlers, app, config) {

  handlers.tools['kelmu-editor'] = KelmuEditor;

  var supportedContentTypes = ['jsvee'];

  app.get('/kelmu-editor', function(req, res) {
    res.set('Content-Type', 'text/html');
    fs.readFile(__dirname + '/editor.html', function(err, data) {
      if (!err) {

        var headContent = '';
        var bodyContent = '';

        var editorScript = '<link href="/static/kelmu-editor/jquery-ui/jquery-ui.min.css" rel="stylesheet">' +
          //'<script src="/static/kelmu-editor/jquery.min.js"></script>' +
          '<script src="/static/kelmu-editor/jquery-ui/jquery-ui.min.js"></script>' +
          '<script src="/static/kelmu/kelmu.editor.js" type="text/javascript"></script>';

        supportedContentTypes.forEach(function(contentType) {
          if (handlers.contentTypes[contentType]) {
            bodyContent += '<div><form method="GET" action="#"><select name="content" onchange="this.form.submit()"><option></option>';
            handlers.contentTypes[contentType].installedContentPackages.forEach(function(package) {
              Object.keys(package.meta.contents).forEach(function(contentElement) {

                var path = [htmlencode(contentType), htmlencode(package.namespace), htmlencode(contentElement)];
                var selected = req.query.content === path.join('|') ? ' selected' : '';
                bodyContent += '<option value="' + path.join('|') + '"' + selected + '>' + path.join(' - ') + '</option>';

              });
            });
            bodyContent += '<select></form></div>';
          }
        });

        if (req.query.content) {
          var selected = req.query.content.split('|');
          if (selected.length === 3 && handlers.contentTypes[selected[0]] && handlers.contentPackages[selected[1]] && handlers.contentPackages[selected[1]].meta.contents[selected[2]]) {

            var reqParams = {
              params: {
                protocol: 'html',
                contentType: selected[0],
                contentPackage: selected[1],
                name: selected[2]
              },
              query: {
                kelmuId: selected[2],
                useKelmu: 1
              }
            };

            var params = {
              'name': selected[2],
              'headContent': '',
              'bodyContent': ''
            };

            bodyContent += '<p>After the annotations are ready, export the definitions and save it to a file with extension <code>.jsonp</code> and put the file online.</p>';
            bodyContent += '<p>Use the URL such as <code>' + htmlencode(config.serverAddress + 'html/' + selected.join('/')) + '?kelmuUrl=http://pathtothedefinition/example.jsonp</code> to launch the animation with the annotations.</p><hr>';

            handlers.protocols.html.initialize(reqParams, params, handlers, function() {
              data = data.toString().replace('<headcontent>', headContent + params.headContent + editorScript).replace('<bodycontent>', bodyContent + params.bodyContent);
              res.send(data);
            });
          } else {
            data = data.toString().replace('<headcontent>', headContent).replace('<bodycontent>', bodyContent);
            res.send(data);
          }
        } else {
          data = data.toString().replace('<headcontent>', headContent).replace('<bodycontent>', bodyContent);
          res.send(data);
        }

      } else {
        res.send("Error");
      }
    });
  });

};

KelmuEditor.namespace = 'kelmu-editor';
KelmuEditor.packageType = 'tool';

KelmuEditor.meta = {
  'name': 'kelmu-editor',
  'shortDescription': 'Tool for using Kelmu annotation editor.',
  'description': '',
  'author': 'Teemu Sirkiä',
  'license': 'MIT',
  'version': '0.1.0',
  'url': ''
};

module.exports = KelmuEditor;
