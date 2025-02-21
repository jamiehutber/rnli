'user strict';

//extend the view with the default home view
module.exports = RN.glb.gvCreator.extend({
	el: '.content',
	templates: {
		home: require('../../../views/trips/tripsCurrent.jade'),
	},
	map: {},
	mapInt: null,
	when: 'present',
	events: {
		'click .retry': 'render',
		'click .starttrip': 'start',
		'click .endtrip': 'end',
		'click .savetrip': 'savetrip',
		'click .enlargetrip': 'enlargeMap'
	},

	start : function(ev){
		var ev = $(ev.currentTarget);
		ev.hide();
		$('.endtrip').show();

		var finalData = RN.currentTrip.prePareDataForDB();
		//write to DB to get trip ID
		RN.currentTrip.startTrip(finalData, function(data){
			//Once AJAX has finished
			RN.currentTrip.saveLocal('tid', data.thistrip);
			RN.currentTrip.saveLocal('started', true);

			//init the gps tracking
			RN.fnc.events.checkGPS();

			//Start GPS Tracking
			if($('input[name=gpstracking]:checked')[0].id==="gpstrackingyes" && RN.glb.url.envioment==="liveApp") {
				//start gps
				RN.gps.onResume();
			}
		});
	},
	end : function(ev){
		var ev = $(ev.currentTarget);
		ev.hide();
		$('.endtrip').hide();
		$('.savetrip').show();


		if($('input[name=gpstracking]:checked')[0].id==="gpstrackingyes" && RN.glb.url.envioment==="liveApp") {
			//start gps
			RN.gps.onPause();
		}
	},
	savetrip : function(){
		var finalData = RN.currentTrip.prePareDataForDB();
		c(finalData);
		RN.currentTrip.finaliseTrip(finalData, function(){
			RN.router.navigate('tripclosed', true);
		});
	},
	enlargeMap : function(ev){
		$('#map-canvas').toggleClass('bigmap');
	},

	whenTrip : function(data){
		var now = moment(),
			self = this,
			difference = now.diff(RN.currentTrip.get('date')[1], 'days');

		if(moment(RN.currentTrip.get('date')[1]).isSame(moment(), 'day')) {
			localStorage.ctripwhen = "present";
		}
		else if(difference < 0) {
			localStorage.ctripwhen = "future";
		}else if (difference > 0) {
			localStorage.ctripwhen = "past";
		}
	},

	render: function () {
		if(RN.currentTrip.get('details')===null){
			RN.fnc.popups.message.show('No Trip Details Were Found', 'bad');
			RN.router.navigate('createtrip', true);
		}else{
			var self = this,
				cords = {
					longitude: RN.currentTrip.get('details').longitude,
					latitude: RN.currentTrip.get('details').latitude
				},
				currentLocationData = RN.currentTrip.get('details') || {};

			//for local dev
			if(typeof currentLocationData === "undefined" && RN.glb.url.envioment === 'localApp') {
				RN.fnc.location.getClosestLocation(cords.latitude, cords.long, RN.currentTrip.get('details').time, function (data) {
					currentLocationData = data;
				});
			}

			//Check when were are
			this.whenTrip();

			if(localStorage.ctripwhen === "past"){
				$('.middle h1').text('PAST TRIP')
			}else if (localStorage.ctripwhen === "future"){
				$('.middle h1').text('FUTURE TRIP')
			}
			
			if(currentLocationData === 'null'){
				//for the user home
				RN.router.navigate('createtrip ', true);
			}else {

				//remove old gmaps span
				$('body > span').remove();

				//Load the page
				if (currentLocationData.waveheight > 3) {
					currentLocationData['notsafe'] = 'danger';
				}
				//load in view with data
				self.$el.html(self.templates.home({data: currentLocationData}));

				//Rerender navigation if we need to
				if(RN.currentTrip.isFuture()){
					//$('.tripfooter a').addClass('disabled').removeAttr('href');
					$('.tripMap').addClass('inTheFuture');
				}

				//Set up google maps
				var styledMap = new google.maps.StyledMapType(RN.glb.gmapStyles, {name: "Styled Map"}),
					myLatlng = new google.maps.LatLng(cords.latitude, cords.longitude),
					mapOptions = {
						zoom: 9,
						center: myLatlng,
						disableDefaultUI: true
					};
				self.mapInt = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

				//Associate the styled map with the MapTypeId and set it to display.
				self.mapInt.mapTypes.set('map_style', styledMap);
				self.mapInt.setMapTypeId('map_style');
				var marker = new google.maps.Marker({
					position: myLatlng,
					map: self.mapInt
				});

				var addRedLInes = typeof localStorage.gps !== typeof undefined;

				if(addRedLInes) {
					var wps = [],
						gpsLocations = JSON.parse(localStorage.gps),
						rendererOptions = {map: self.mapInt},
						directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions),
						firstItem = gpsLocations[Object.keys(gpsLocations)[0]],
						lastItem = gpsLocations[Object.keys(gpsLocations)[Object.keys(gpsLocations).length - 1]];
					
					//build up wps
					Object.keys(gpsLocations).forEach(function (key, item) {
						var lat = gpsLocations[key].latitude,
							long = gpsLocations[key].longitude;
						wps.push({
							location: new google.maps.LatLng(lat, long)
						});
					});

					var org = new google.maps.LatLng(firstItem.latitude, firstItem.longitude);
					var dest = new google.maps.LatLng(lastItem.latitude, lastItem.longitude);

					var request = {
						origin: org,
						destination: dest,
						//waypoints: wps,
						travelMode: google.maps.DirectionsTravelMode.DRIVING
					};

					directionsService = new google.maps.DirectionsService();
					directionsService.route(request, function (response, status) {
						if (status == google.maps.DirectionsStatus.OK) {
							directionsDisplay.setDirections(response);
						}
						else
							RN.fnc.popups.message('We could not get your route. Please try again later', 'notice')
					});
				}

			}
		}

		//check to see which day we are in
		if(!RN.currentTrip.isToday()){
			$('.starttrip').hide();
			$('.endtrip').hide();
			$('.savetrip').show();
		}

		if(RN.currentTrip.get('started') !== null) {

			$('.starttrip').hide();
			$('.endtrip').show();
		}
	}
});