$('#submit').on('click', function (e) {
    e.preventDefault();
    let searchTag = $('#searchInput').val().trim();
    let locationTag = $('#locationInput').val().trim();
    sessionStorage.setItem('searchTag', `${searchTag}`);
    sessionStorage.setItem('locationTag', `${locationTag}`);
    location.replace("/search")
});

/**
 * -Gets the restaurant JSON from database
 * -Pulls out needed info for info box
 * -Creates list for the information
 * -Adds pin and map for JSON lat/lon
 */
function initMap() {
    $.ajax({
        url: `/api/restaurant`,
        method: 'GET',
    }).then(function (data) {
        const queryAlias = window.location.search.substring(7)
        const phoneFormat = function (phone) {
            const areaCode = phone.substring(2, 5);
            const preFix = phone.substring(5, 8)
            const lastFour = phone.substring(8)
            return `(${areaCode})-${preFix}-${lastFour}`
        };
        data.map(function (obj) {
            if (queryAlias === obj.alias) {
                const latitude = obj.coordinates.latitude;
                const longitude = obj.coordinates.longitude;
                const name = obj.name;
                const state = obj.location.state;
                const street = obj.location.address1;
                const city = obj.location.city;
                const zipCode = obj.location.zip_code;
                const phone = phoneFormat(obj.phone);
                const url = obj.url;
                const directions = `https://www.google.com/maps/dir/?api=1&origin=my%20location&destination=${latitude},${longitude}&dir_action=navigate&travelmode=driving`

                const info = `<ul>
                <li><i class="fas fa-map-marker-alt"></i><p> <span>${street}<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${state}, ${city} ${zipCode}</span></p></li>
                <li><i class="fas fa-directions"></i>&nbsp;<a target=_blank href=${directions}>Get Directions</a></li>
                <li><i class="fas fa-phone fa-flip-horizontal"></i>&nbsp;${phone}</li>
                <li><i class="fas fa-external-link-alt"></i>&nbsp;<a target=_blank href='${url}'>${name}</a></li>
                <li><i class="fas fa-mobile-alt"></i>&nbsp;<a href='#'>Send to your phone</a></li></ul>`;
                $('.mapBoxText').html(info);

                const uluru = { lat: latitude, lng: longitude };
                const map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 15,
                    center: uluru,
                    tilt: 45,
                    disableDefaultUI: true
                });
                const marker = new google.maps.Marker({
                    position: uluru,
                    map: map,
                    title: `${name}`,
                    label: {
                        text: 'Yelp',
                        fontSize: '10px',
                    }
                });
            }
        })
    })

}
initMap()


/**
 * Searches database for businesses based on URL alias
 * @param {dataList}  all restaurants.
 * @param {business}  each specific restaurants.
 * @const {newID}  the trimmed version of the URL to match an restaurant's alias.
 * if dataList[i].alias match with newID change the id of that class to newID.
 * if the business personal review 'already_reviewed' field is true change the "write a review" button to "edit your review" 
 */
$.ajax({ url: `/api/restaurant/${window.location.search}`, method: "GET" })
    .then(function (dataList) {
        const newID = window.location.search.substring(7);
        dataList.forEach((business) => {
            if (business.alias === newID) {
                $(".review").attr("id", newID);
                if(business.personal_review.already_reviewed === 'true' || business.personal_review.already_reviewed === true ){
                const edit = "Edit your Review"
                $('.review').text("Edit Your Review") 
                }
            }
          });
    })

/**
 * On click function go to new location href.
 * @location.href = added url string and target id.
 */
$('.review').on('click', function (event) {
    event.preventDefault();
    if (event.target.id) {
        location.href = `review?alias=${event.target.id}`;
    }
})

/**
 * initBody uses an AJAX call to pull business
 * info out of the database. It is inserted into 
 * the DOM using .html. 
 */
const initBody = function () {
    $.ajax({
        url: `/api/restaurant/${window.location.search}`,
        method: 'GET',
        type: 'object'
    }).then(function (data) {
        const newID = window.location.search.substring(7)
        data.filter(function (obj) {
            if (newID === obj.alias) {

                let header = "";
                header += `<h1>${obj.name}</h1>`;
                header += `<div class='biz-rating'><div class='i-stars ${getStarRatingClass(obj.rating)}' title='${obj.rating}'><img class="offscreen" height="303" src="https://s3-media2.fl.yelpcdn.com/assets/srv0/yelp_design_web/9b34e39ccbeb/assets/img/stars/stars.png" width="84" alt="${obj.rating} star rating"></div><span class='review-count'>${obj.review_count} reviews</span></div>`;
                header += `<div class='price-category'><span class='bullet-after'><span class='price-range'>${obj.price || ''}</span></span><span class='category-list'>${anchorCategories(obj.categories)}</span></div>`;
                $(".details").html(header);

                let reviewHead = "";
                reviewHead += `<h3><span>Recommended Reviews</span> for ${obj.name}</h3>`;
                $(".recommend").html(reviewHead);

                let review = "";
                review += `<div class="line"><p class="user">Gordon Ramsey</p>`;
                review += `<p class="home">Hell's Kitchen</p></div>`;
                review += `<div class="line"><div class='biz-rating2'><div class='i-stars2 ${getStarRatingClass(obj.personal_review.personal_review_rating)}'><img class="offscreen" height="303" src="https://s3-media2.fl.yelpcdn.com/assets/srv0/yelp_design_web/9b34e39ccbeb/assets/img/stars/stars.png" width="84" alt="${obj.rating} star rating"></div><span class='review-date'>${obj.personal_review.personal_review_time}</span></div>`;
                review += `<p class="thoughts">${obj.personal_review.personal_review_text}</p></div>`;
                $(".user-review").html(review);

                let photos = "";
                photos += `<img src="${obj.image_url}" alt="Restaurant Photo" width="250px" height="250px">`;
                $(".photos").html(photos);
            }
        });
    })
}
initBody();

/**
 * initReviews uses an AJAX call to pull
 * reviews out of the database. It is inserted 
 * into the DOM using .html. 
 */
const initReviews = function () {
    $.ajax({
        url: `/api/review`,
        method: 'GET',
        type: 'object'
    }).then(function (data) {

        const reviews = window.location.search.substring(7)
        const prefix = "https://www.yelp.com/biz/";
        data.forEach((business) => {
            const noPre = business.url.replace(prefix, '');
            const newAlias = noPre.substring(0, noPre.indexOf("?"));
            if (newAlias === reviews) {
                let review = "";
                review += `<div class="line"><p class="user">${business.user.name}</p>`;
                review += `<p class="home">Somewhere in the World</p></div>`;
                review += `<div class="line"><div class='biz-rating2'><div class='i-stars2 ${getStarRatingClass(business.rating)}'><img class="offscreen" height="303" src="https://s3-media2.fl.yelpcdn.com/assets/srv0/yelp_design_web/9b34e39ccbeb/assets/img/stars/stars.png" width="84" alt="${business.rating} star rating"></div><span class='review-date'>${business.time_created}</span></div>`;
                review += `<p class="thoughts">${business.text}</p></div>`;
                $(".seeded-review").html(review);
            }
          });
    })
}
initReviews();

/**
 * initTitle uses an AJAX call to pull business
 * info out of the database using an alias from 
 * the window. It is inserted into the 
 * DOM using .html.
 */
const initTitle = function () {
    $.ajax({
        url: `/api/restaurant/${window.location.search}`,
        method: 'GET',
        type: 'object'
    }).then(function (data) {
        const newID = window.location.search.substring(7)
        data.filter(function (obj) {
            if (newID === obj.alias) {
                let title = "";
                title = `${obj.name}`;
                $("title").html(title);
            }
        })
    })

}
initTitle();