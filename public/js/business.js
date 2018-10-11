//GOOGLE MAPS INTERGRATION
function initMap() {
    $.ajax({
        url: '/api/business',
        method: 'GET',
        dataType: 'json',
    }).then(function (data) {
        console.log(data[0])
        const latitude = data[0].coordinates.latitude;
        const longitude = data[0].coordinates.longitude;
        const name = data[0].name;
        const state = data[0].location.state;
        const street = data[0].location.address1;
        const city = data[0].location.city;
        const zipCode = data[0].location.zip_code;
        const phone = data[0].phone;
        const url = data[0].url;
        const info = `<ul>
        <li><i class="fas fa-map-marker-alt"></i><p> <span>${street}<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${state}, ${city} ${zipCode}</span></p></li>
        <li><i class="fas fa-directions"></i>&nbsp;<a href='#'>Get Directions</a></li>
        <li><i class="fas fa-phone fa-flip-horizontal"></i>&nbsp;${phone}</li>
        <li><i class="fas fa-external-link-alt"></i>&nbsp;<a href='${url}'>${name}</a></li>
        <li><i class="fas fa-mobile-alt"></i>&nbsp;<a href='#'>Send to your phone</a></li></ul>`;
        $('.mapBoxText').append(info);            
                        
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
            title: `${name}`
        });
    })    
}

$('.review').on('click', function (event) {
    event.preventDefault();
    location.href = "/write";
    console.log(event)
})