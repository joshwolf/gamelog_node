var _ = require('lodash');

var GamelogUtils = {
	humanizeList: function(items) {
      var _items = (items || []);
      if (_items.length < 2)
      {
        return _items[0];
      }
      else {
        return _items.slice(0, -1).join(', ') + ' and ' + _.last(_items);
      }
    }
}

module.exports = GamelogUtils;