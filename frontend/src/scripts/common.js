var baseURL = 'http://localhost:5000';

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