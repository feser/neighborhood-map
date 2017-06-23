/* map is used to select markers and filter markers */
var map;
/* marker array*/
var markers = [];
/* keep latitude, longtitude and title of locations */
var locationArray = [
    {
        title: 'Amsterdam Museum',
        location: {lat: 52.37014, lng: 4.889902}
    },
    {
        title: 'NEMO Science Museum',
        location: {lat: 52.3742274, lng: 4.9121498}
    },
    {
        title: 'Hash Museum',
        location: {lat: 52.3717838, lng: 4.894731}
    },
    {
        title: 'Melkweg',
        location: {lat: 52.3647893, lng: 4.881}
    },
    {
        title: 'Royal Palace Amsterdam',
        location: {lat: 52.3733063, lng: 4.8915}
    },
    {
        title: 'Royal Theatre Carre',
        location: {lat: 52.3623905, lng: 4.904}
    },
    {
        title: 'Stopera',
        location: {lat: 52.3674965, lng: 4.902}
    },
    {
        title: 'Rijksmuseum Amsterdam',
        location: {lat: 52.3599976, lng: 4.885}
    },
    {
        title: 'Hermitage Amsterdam',
        location: {lat: 52.3652, lng: 4.9025}
    },
    {
        title: 'Van Gogh Museum',
        location: {lat: 52.358, lng: 4.881}
    }
];

var Location = function(data){
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
};

var infowindow;
var bounds;

// creates infowindow with flickr image
function locationClickEvent() {
    // prepare flicker url
    var marker = this;
    var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&';
    flickrUrl += 'api_key=665d16034cc6c5459e36fda6c2533cd7&per_page=10&format=json&';
    flickrUrl += 'nojsoncallback=1&';
    flickrUrl += 'lat=' + marker.getPosition().lat();
    flickrUrl += '&lon=' + marker.getPosition().lng();
    flickrUrl += '&tags='+ marker.title+'&media=photos&accuracy=16&sort=relevance';
    // get flicker image asynchronously
    $.getJSON(flickrUrl, function(data){
        if(data.stat != 'fail' && data.photos.photo.length > 0) {
            if (infowindow.marker != marker) {
                marker.setAnimation(google.maps.Animation.DROP);
                infowindow.marker = marker;
                var photo = data.photos.photo[0];
                // create image url. _q suffix means small image
                var src = 'https://farm'+ photo.farm;
                src += '.staticflickr.com/'+ photo.server;
                src += '/'+ photo.id +'_'+ photo.secret+'_q.jpg';
                var htmlTitle = '<span>'+ marker.title+'</span><br/>';
                var htmlSrc = '<img src="' + src + '"></img>';
                infowindow.setContent(htmlTitle + htmlSrc);
                infowindow.open(map, marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        }
    }).fail(function(jqxhr){
        alert("Flickr image couldn't be retrieved");
    });
}

var ViewModel = function() {
    var self = this;

    // create map instance
    map = new google.maps.Map($("#map")[0], {
      zoom: 17,
      mapTypeControl: false
    });

    this.locationList = ko.observableArray([]);
    bounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();
    // create markers and knockout location list
    for (var i = 0; i < locationArray.length; i++) {
        self.locationList.push(new Location(locationArray[i]));
        var position = locationArray[i].location;
        var title = locationArray[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        bounds.extend(position);
        marker.setMap(map);
        marker.addListener('click', locationClickEvent);
        markers.push(marker);
    }
    map.fitBounds(bounds);
    google.maps.event.addDomListener(window, 'resize', function() {
      map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    });


    search = ko.observable('');
    // filter location list by given value
    search.subscribe(function(value) {
        self.locationList.removeAll();
        for (var i = 0; i < locationArray.length; i++) {
            // if location title contains given input
            if(locationArray[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.locationList.push(new Location(locationArray[i]));
            }
        }
        markers.forEach(function(marker){
            for(var i = 0; i < self.locationList().length; i++){
                // if marker exists in filtered list
                if(self.locationList()[i].title() == marker.getTitle()){
                    marker.setVisible (true);
                    return;
                }
            }
            // if marker doesn't exist in filtered list, delete it
            marker.setVisible(false);
        });
    });
};

// Google Map API callback function
function initMap() {
    ko.applyBindings(new ViewModel());
}

function onGoogleMapsAPIError() {
    alert("Couldn't access Google Maps API.");
}

// sidebar location list item click event
function selectLocation(location){
        for(var i = 0; i < markers.length; i++){
            // if marker equals to selected location, click event is triggered
            if(markers[i].getTitle() == location.title()){
                new google.maps.event.trigger( markers[i], 'click' );
                return;
            }
        }
}
