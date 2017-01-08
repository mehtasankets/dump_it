// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


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

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.querySelector('#butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.querySelector('#butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.querySelector('#butAddCity').addEventListener('click', function() {
    // Add the newly selected city
    var select = document.querySelector('#selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    // TODO init the app.selectedCities array here
    app.getForecast(key, label);
    // TODO push the selected city to the array and save here
    app.toggleAddDialog(false);
  });

  document.querySelector('#butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });

  function addFocusEvents() {
    document.querySelector('.cards').addEventListener('click', function(e) {
      toggleCardState(e);
    });
  }

  function toggleCardState(e) {
    console.log('toggle');
    var currElem = e.target;
    while(!currElem.classList.contains('card')) {
      currElem = currElem.parentElement;
    }
    var card = currElem;
    if(card.querySelector('.data').classList.contains('elipsis')) {
      card.querySelector('.data').classList.remove('elipsis');
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

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateData = function(data) {
    console.log(data);
    var tabIndex = 0;
    data.forEach(function (d) {
      var card = app.visibleCards[d.id];
      if(!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        card.setAttribute('tabIndex', tabIndex++);
        card.querySelector('.data').innerHTML = d.data + 'aaaaaaaaaaaaaaaaaasdlkf ajlsdkfj alksdjflka dsjflk ajdslkfjalskdjf laksdjfl asdjfklasjdflkajsdklfjalskdfjalksdjfl akjsdlfkajlsd '; 
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
  };

  var dataPromise = getAllInitialData();
  dataPromise.then(function(response) {
    app.updateData(response);
  }).catch(function(err) {
    throw new Error('Error while fetching data', err);
  });
  

  function getAllInitialData() {
    return new Promise(function(resolve, reject) {
      fetch('http://localhost:5000/getAllData').then(function(response) {
        resolve(response.json());
      }).catch(function(err) {
        reject(err);
      });
    });
  }

})();
