let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      const $map = document.getElementById('map');
      self.map = new google.maps.Map($map, {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      const listener = self.map.addListener('tilesloaded', () => {
        const els = $map.querySelectorAll('div, a, area, iframe');
        els.forEach(el => {
          el.setAttribute('tabindex', '-1');
        });
        google.maps.event.removeListener(listener);
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;


  const pictureConfig = [
    {
      media: `(max-width: 619px)`,
      reference: `large`
    },
    // {
    //   media: `(min-width: 620px) and (max-width: 779px)`,
    //   reference: `medium`
    // },
    // {
    //   media: `(min-width: 780px)`,
    //   reference: `small`
    // }
  ];



  const image = document.getElementById('restaurant-content');

  const newNode = DBHelper.buildPictureElementForForRestaurant(pictureConfig, restaurant);

  //image.parentNode.insertBefore(newNode, image);

  //image.appendChild(newNode);

  //image.append();


  // const picture = document.createElement('picture');

  // const source1




  // const image = document.getElementById('restaurant-img');
  // image.className = 'restaurant-img'
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // image.setAttribute('alt', `View of ${restaurant.name}`);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');

  const caption = document.createElement('caption');
  caption.innerHTML = 'Restaurant opening hours';
  hours.appendChild(caption);

  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const fullDay = document.createElement('th');
    fullDay.setAttribute('scope', 'row');
    fullDay.classList.add('full-day');
    fullDay.innerHTML = key;
    row.appendChild(fullDay);

    const day = document.createElement('th');
    day.setAttribute('scope', 'row');
    day.classList.add('short-day');
    day.innerHTML = key.substr(0, 3);
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');

  const quote = document.createElement('blockquote');
  li.appendChild(quote);

  const name = document.createElement('p');
  name.classList.add('review-item__author-date');
  name.innerHTML = `<cite>${review.name}</cite> <span>${review.date}</span>`;
  quote.appendChild(name);

  const rating = document.createElement('p');
  rating.classList.add('review-item__rating');
  rating.innerHTML = createRatingHTML(review.rating);
  quote.appendChild(rating);

  const comments = document.createElement('p');
  comments.classList.add('review-item__comments');
  comments.innerHTML = `<span>&ldquo;</span> ${review.comments} <span>&rdquo;</span>`;
  quote.appendChild(comments);

  return li;
}

/**
 * Creates the rating stars for restaurant reviews
 */
createRatingHTML = (rating = 0) => {
  const reviewMaximum = 5;
  const reviewRating = rating <= reviewMaximum ? rating : reviewMaximum;
  const reviewRemaining = reviewMaximum - reviewRating;
  let result = ``;
  for (let i = 0; i < reviewRating; i++) {
    result += `★`;
  }
  if (reviewRemaining) {
    for (let i = 0; i < reviewRemaining; i++) {
      result += `☆`;
    }
  }
  return result;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
