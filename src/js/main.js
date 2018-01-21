let markers = [];
let map;
var initMap = function() {

    let latitude, longitude;
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            createMap(latitude, longitude);
        });
    } else{
        createMap(19.0760, 72.8777);
    }
};
function createMap(latitude, longitude){

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: latitude, lng: longitude},
        zoom: 11
    });
    var image = './../images/person.min.png';
    let homeMarker = new google.maps.Marker({
        position: {lat: latitude, lng: longitude},
        map: map,
        icon: image
    });

    let runnerObj = {
        latInt: parseInt(latitude),
        longInt: parseInt(longitude),
        map: map,
        latitude: latitude.toPrecision(6),
        longitude: longitude.toPrecision(6)
    };
    runner(runnerObj);
    var input = document.getElementById('location-input');

    let autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    autocomplete.addListener('place_changed', function() {
        homeMarker.setMap(null);

        let place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        map.setCenter(place.geometry.location);
        map.setZoom(14);
        let place_lat = place.geometry.location.lat(), place_lng = place.geometry.location.lng();
        homeMarker = new google.maps.Marker({
            position: {lat: place_lat, lng: place_lng},
            map: map,
            icon: image
        });
        let ConfigObj = {
            latInt: parseInt(place_lat),
            longInt: parseInt(place_lng),
            map: map,
            latitude: place_lat.toPrecision(6),
            longitude: place_lng.toPrecision(6)
        };
        runner(ConfigObj);
    });

}

//async function for calling the api
async function runner(runnerObj){


    if(markers.length){
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }
    markers = [];
    let locations = [];
    let hotelDetails = [];
    let hotelsSearchObj = {
        "count": 30,
        "lat": runnerObj.latitude,
        "lon": runnerObj.longitude,
        "radius": 500.0,
        "collection_id": 1
    };
    let result = await getHotelDetails(hotelsSearchObj).then((data) => data);
    let j=1;
    result.restaurants.forEach((obj)=>{
        let item = {
            title: obj.restaurant.name,
            location:{
                lat: parseFloat(obj.restaurant.location.latitude),
                lng: parseFloat(obj.restaurant.location.longitude)
            },
            id: j
        };
        let data = {
            title: obj.restaurant.name,
            address: obj.restaurant.location.address,
            cuisines: obj.restaurant.cuisines,
            cost_for_two: obj.restaurant.average_cost_for_two,
            image: obj.restaurant.featured_image,
            online_delivery: (obj.restaurant.has_online_delivery !== 0),
            delivering_now: (obj.restaurant.is_delivering_now !==0),
            thumbnail: obj.restaurant.thumb,
            ratings: obj.restaurant.user_rating.aggregate_rating,
            currency: obj.restaurant.currency,
            id: j,
            url: obj.restaurant.url
        };
        j++;
        locations.push(item);
        hotelDetails.push(data);
    });

    // serializing the input in-case of rogue data returned by the api
    for(let i=0; i<locations.length; i++){
        if(parseInt(locations[i].location.lat) !== runnerObj.latInt || parseInt(locations[i].location.lng) !== runnerObj.longInt){
            locations.splice(i, 1);
            hotelDetails.splice(i, 1);
            i--;
        }
    }
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    if(locations.length) {
         for (let i = 0; i < locations.length; i++) {
             var position1 = locations[i].location;
             var title = locations[i].title;
    
             var marker = new google.maps.Marker({
                 map: runnerObj.map,
                 position: position1,
                 title: title,
                 animation: google.maps.Animation.DROP,
                 id: i,
                 restaurant: hotelDetails[i],
                 icon: './../images/restaurant.min.png'
             });
             markers.push(marker);
             bounds.extend(marker.position);
    
             marker.addListener('click', function () {
                 populateInfoWindow(this, largeInfowindow);
                 renderDetails(this);
             });
         }
        populateInfoWindow(markers[0], largeInfowindow);
        renderDetails(markers[0]);
        runnerObj.map.fitBounds(bounds);
    }
}
function renderDetails(marker){
    if(marker.restaurant.image != "") {
        document.getElementById("featured_image").src = marker.restaurant.image;
    }else{
        document.getElementById("featured_image").src = "./../images/dummy_image.min.jpg";
    }
    if(marker.restaurant.thumbnail != "") {
        document.getElementById("thumbnail-image").src = marker.restaurant.image;
    }else{
        document.getElementById("thumbnail-image").src = "./../images/dummy_thumbnail.min.jpg";
    }
    if(marker.restaurant.title.length > 18){
        document.getElementById("name").innerHTML = marker.restaurant.title.substring(0,18) + "..";
    }
    else{
        document.getElementById("name").innerHTML = marker.restaurant.title;
    }
    if(marker.restaurant.address.length > 30){
        if(marker.restaurant.title.length < 18){
            document.getElementById("address").innerHTML = marker.restaurant.address.substring(0,40) + "..";
        }else {
            document.getElementById("address").innerHTML = marker.restaurant.address.substring(0, 30) + "..";
        }
    }
    else{
        document.getElementById("address").innerHTML = marker.restaurant.address;
    }
    document.getElementById("cuisines").innerHTML = marker.restaurant.cuisines;
    document.getElementById("cost").innerHTML = "Cost "+marker.restaurant.currency +
        marker.restaurant.cost_for_two+ " for two";
    document.getElementById("url").href = marker.restaurant.url;
    document.getElementById("star-rating").innerHTML = marker.restaurant.ratings;
    if(!marker.restaurant.online_delivery){
        document.getElementById("online-delivery").innerHTML = "Does not Deliver Online";
        document.getElementById("delivering-now").style.display = "none";
    } else{
        document.getElementById("online-delivery").innerHTML = "Deliver's Online";
        document.getElementById("delivering-now").style.display = "block";
        if(!marker.restaurant.delivering_now)
            document.getElementById("delivering-now").innerHTML = "Not Delivering Now";
        else
            document.getElementById("delivering-now").innerHTML = "Delivering Now";
    }

}
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
    
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker(null);
            });
    }
}
let createURL = function (position) {
    let esc = encodeURIComponent;
    return new Promise(function (resolve) {
        resolve(Object.keys(position)
            .map(function (k) {
                return esc(k) + '=' + esc(position[k])
            }).join('&'))
    })
};
function getHotelDetails(hotelsSearchObj){
    let url;
    return new Promise((resolve, reject) => {
        createURL(hotelsSearchObj).then((query)=> {
            url = 'https://developers.zomato.com/api/v2.1/search?' + query;
            return url;
        }).then((url) => {
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'user-key': '3ee96372b5c0235a94ca049acad2ea71',
                    'content-type': 'application/json'
                })
            }).then((res) => {
                var data =res.json();
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
        });
    })
}