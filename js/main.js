let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  const $map = document.getElementById('map');
  self.map = new google.maps.Map($map, {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  const listener = self.map.addListener('tilesloaded', () => {
    const els = $map.querySelectorAll('div, a, area, iframe');
    els.forEach(el => {
      el.setAttribute('tabindex', '-1');
    });
    google.maps.event.removeListener(listener);
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.classList.add('restaurants-list__item')
  li.classList.add('flex-full');
  
  const title = document.createElement('div');
  title.classList.add('restaurants-list__item-title');
  li.append(title);

  const pictureConfig = [
    {
      media: `(max-width: 619px)`,
      reference: `large`
    },
    {
      media: `(min-width: 620px) and (max-width: 779px)`,
      reference: `medium`
    },
    {
      media: `(min-width: 780px)`,
      reference: `small`
    }
  ];

  title.append(DBHelper.buildPictureElementForForRestaurant(pictureConfig, restaurant));

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  title.append(name);

  const content = document.createElement('div');
  content.classList.add('restaurants-list__item-content');
  li.append(content);
  
  const neighborhood = document.createElement('h2');
  neighborhood.innerHTML = restaurant.neighborhood;
  content.append(neighborhood);

  const address = document.createElement('address');
  address.innerHTML = restaurant.address;
  content.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Restaurant Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  content.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Manage focus should the user use the skip links
 */
(manageSkipLinkFocus = () => {

  const skipLinks = document.querySelectorAll('a.skip-link.manage-focus');

  if (skipLinks.length < 2) return;

  const skipToRestaurant = skipLinks[0];
  const skipToFilters = skipLinks[1];

  skipToRestaurant.addEventListener('click', () => {
    const restaurantList = document.getElementById('restaurants-list');
    const firstLink = restaurantList.querySelectorAll('a')[0];
    // Timeout required to activate the focus once the browser has
    // scrolled the page down to the correct section
    window.setTimeout(() => {
      firstLink.focus();
    }, 0);
  });

  skipToFilters.addEventListener('click', () => {
    const firstFilter = document.getElementById('neighborhoods-select');
    // Timeout required to activate the focus once the browser has
    // scrolled the page down to the correct section
    window.setTimeout(() => {
      firstFilter.focus();
    }, 0);
  });

})();
