/* Description:
 *   Loads content from Mozilla Etherpads.
 *
 * Dependencies:
 *   none
 *
 * Author:
 *    mythmon
 */

var cheerio = require('cheerio');
var nunjucks = require('nunjucks');


module.exports = function(corsica) {

  nunjucks.configure(__dirname);
  var etherpad_re = RegExp('^https?://etherpad.mozilla.org/(.*)$');

  corsica.on('content', function(msg) {
    if (!('url' in msg)) {
      return msg;
    }

    var match = msg.url.match(etherpad_re);
    if (!match) {
      return msg;
    }

    var title = match[1];
    var htmlUrl = 'https://etherpad.mozilla.org/ep/pad/export/' + title + '/latest?format=html'
    return corsica.http(htmlUrl)
    .then(function(page) {
      var body = cheerio.load(page)('body').html();

      msg.url = undefined;
      msg.type = 'html';
      msg.content = nunjucks.render('template.html', {
        body: body,
        title: title,
      });
      return msg;
    });
  });
};
