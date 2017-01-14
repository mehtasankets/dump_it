(function() {
  'use strict';

  var textareas = document.querySelectorAll('.auto-expand');

  textareas.forEach(function(textarea){
    textarea.addEventListener('keydown', autosize);
  });
              
  function autosize(){
    console.log('yey');
    var el = this;
    setTimeout(function(){
      el.style.cssText = 'height:auto; padding:0';
      el.style.cssText = 'height:' + el.scrollHeight + 'px';
    },0);
  }

  function getData(url) {
    return new Promise(function(resolve, reject) {
      fetch(url).then(function(response) {
        resolve(response.text());
      }).catch(function(err) {
        reject(err);
      });
    });
  }

  function postData(url, payload) {
    var data = new FormData();
    data.append("json", JSON.stringify(payload));
    var formData = { method: 'POST', body: data};
    return new Promise(function(resolve, reject) {
      fetch(url, formData).then(function(response) {
        resolve(response.json());
      }).catch(function(err) {
        reject(err);
      });
    });
  }

})();
