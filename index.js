  exports.index = function(req, res){
    res.render('index', { title: 'Express' });
  };

  exports.contact = function(req, res){
    res.render('/contact', { title: 'contact' });
  };

  exports.about = function(req, res){
    res.render('/about', { title: 'about' });
  };