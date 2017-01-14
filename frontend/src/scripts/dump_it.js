(function() {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.cards'),
    addDialog: document.querySelector('.dialog-container')
  };

  var focussedElement;

  var READ_STATUS = 1;

  var _data;

  function addFocusEvents() {
    document.querySelector('.cards').addEventListener('click', function(e) {
      toggleCardState(e);
    });
  }

  function toggleCardState(e) {
    var currElem = e.target;
    while(!currElem.classList.contains('card')) {
      currElem = currElem.parentElement;
    }
    var card = currElem;
    if(card.querySelector('.data').classList.contains('elipsis')) {
      card.querySelector('.data').classList.remove('elipsis');
      updateStatus(card, READ_STATUS);
    } else {
      card.querySelector('.data').classList.add('elipsis');
    }
    if(card.querySelector('.posted-by').classList.contains('elipsis')) {
      card.querySelector('.posted-by').classList.remove('elipsis');
    } else {
      card.querySelector('.posted-by').classList.add('elipsis');
    }
    var prevElem = focussedElement;
    if(prevElem && prevElem != card) {
      prevElem.querySelector('.data').classList.add('elipsis');
      prevElem.querySelector('.posted-by').classList.add('elipsis');
    }
    focussedElement = card;
  }

  function updateStatus(card, statusId) {
    if(card.classList.contains('read')) {
      return;
    }
    var dataDumpId = card.dataset.dataDumpId;
    var dataPromise = getData(`${baseURL}/updateStatus?data_dump_id=${dataDumpId}&status_id=${statusId}`);
    dataPromise.then(function(response) {
      card.classList.remove('unread');
      card.classList.add('read');
    }).catch(function(err) {
      throw new Error('Error while updating status', err);
    });
  }

  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.updateData = function(data) {
    var tabIndex = 0;
    data.sort(function(a, b){
      return (a.status > b.status)? -1 : 1;
    });
    data.forEach(function (d) {
      var card = app.visibleCards[d.id];
      if(!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        card.setAttribute('tabIndex', tabIndex++);
        card.dataset.dataDumpId = d.id;
        card.querySelector('.data').innerHTML = d.data; 
        card.querySelector('.user').textContent = d.owner.name;
        card.querySelector('.group').textContent = d.group.name;
        var status = d.status.toLowerCase();
        card.classList.add(status);
        card.removeAttribute('hidden');
        app.container.appendChild(card);
        app.visibleCards[data.id] = card;
      }  
    });
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
    addFocusEvents();
    return data;
  };

  var dataPromise = getData(`${baseURL}/getAllData`);
  dataPromise.then(function(response) {
    _data = app.updateData(JSON.parse(response));
  }).catch(function(err) {
    throw new Error('Error while fetching data', err);
  });

})();
