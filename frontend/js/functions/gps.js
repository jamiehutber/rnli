module.exports = function () {
	'use strict';

	var gps = {
		bgGeo: null
	};

	gps = {
		/**
		 * @property {Boolean} aggressiveEnabled
		 */
		aggressiveEnabled: false,
		/**
		 * @property {Array} locations List of rendered map markers of prev locations
		 */
		locations: [],
		/**
		 * @private
		 */
		addToLocalStorage: function (data) {
			var item = {},
				previousStorage = {};
			if(typeof localStorage.gps !== typeof undefined) {
				previousStorage = JSON.parse(localStorage.gps);
			}
			previousStorage[moment().format('YYYY-MM-DD HH:mm:ss')] = data;
			localStorage.setItem('gps', JSON.stringify(previousStorage));
		},
		send: function(){
			$.ajax({
				url: 'http://trackmycatch.rnli.org/api/location/takeGPS',
				type: 'POST',
				dataType: "json",
				data: {
					'lat': '1212',
					'long': '12312'
				},
				error: function (data) {
				},
				success: function (data) {
				}
			});
		},
		configureBackgroundGeoLocation: function() {
			var fgGeo = window.navigator.geolocation;
				gps.bgGeo = window.plugins.backgroundGeoLocation;
			//jamie
			var yourAjaxCallback = function(response) {
				gps.bgGeo.finish();
				c('ajax callback');
			};

			var callbackFn = function(location) {
				console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
				// Update our current-position marker.
				gps.setCurrentLocation(location);
				yourAjaxCallback.call(this);
			};

			var failureFn = function(error) {
				console.log('BackgroundGeoLocation error');
			};

			gps.bgGeo.onStationary(function(location) {
				gps.addToLocalStorage(location);
				console.log('- Device is stopped: ', location.latitude, location.longitude);
			});

			// BackgroundGeoLocation is highly configurable.
			gps.bgGeo.configure(callbackFn, failureFn, {
				debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
				desiredAccuracy: 500,
				stationaryRadius: 0,
				distanceFilter: 0,
				locationUpdateInterval: 10,
				activityRecognitionInterval: 10,
				stopTimeout: 0,
				forceReload: false,      // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app (WARNING: possibly distruptive to user)
				stopOnTerminate: false, // <-- [Android] Allow the background-service to run headless when user closes the app.
				startOnBoot: false,      // <-- [Android] Auto start background-service in headless mode when device is powered-up.
				activityType: 'AutomotiveNavigation',
				url: 'http://trackmycatch.rnli.org/api/location/takeGPS',
				params: {
					"uid": RN.user.get('uid'),
					"tid": RN.currentTrip.get('tid')
				}
			});
		},
		timer: null,
		startWatchPosition: function () {
			gps.timer = setTimeout(gps.watchPosition, 30000);
		},
		stopWatchPosition: function () {
			gps.stopPositionWatch();
			clearTimeout(gps.timer);
		},
		watchPosition: function() {
			var fgGeo = window.navigator.geolocation;
			if (gps.watchId) {
				gps.stopPositionWatch();
			}
			// Watch foreground location
			gps.watchId = fgGeo.watchPosition(function(location) {
				gps.setCurrentLocation(location.coords);
			}, function() {}, {
				enableHighAccuracy: true,
				maximumAge: 5000,
				frequency: 30000,
				timeout: 10000
			});
		},
		stopPositionWatch: function() {
			var fgGeo = window.navigator.geolocation;
			if (gps.watchId) {
				fgGeo.clearWatch(gps.watchId);
				gps.watchId = undefined;
			}
		},
		onPause: function() {
			console.log('- Stop');
			gps.stopWatchPosition();
			gps.bgGeo.stop();
		},
		onResume: function() {
			gps.bgGeo.start(function(){
				console.log('- Start');
			}, function () {
				c('failed');
			});
			gps.startWatchPosition();
		},
		// Update DOM on a Received Event
		setCurrentLocation: function(location) {
			gps.addToLocalStorage(location);

			if (gps.previousLocation) {
				//c('We have not moved');
			}

			// Add breadcrumb to current Polyline path.
			gps.previousLocation = location;
		}
	};
	if(RN.glb.url.envioment==="liveApp") {
		gps.configureBackgroundGeoLocation();
	};
	return gps;
};