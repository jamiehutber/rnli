/**
 * Created by Hutber on 12/02/2015.
 */
'use strict';
module.exports = function(){

	var connection = {};

	/*==================================================
	 Networking functions
	 ================================================== */
	connection.checkConnection = function (){
		if(RN.glb.envioment==="liveApp") {
			connection.connection = navigator.connection.type;

			var states = {};
			states[Connection.UNKNOWN] = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI] = 'WiFi connection';
			states[Connection.CELL_2G] = 'Cell 2G connection';
			states[Connection.CELL_3G] = 'Cell 3G connection';
			states[Connection.CELL_4G] = 'Cell 4G connection';
			states[Connection.CELL] = 'Cell generic connection';
			states[Connection.NONE] = 'No network connection';

			//alert('Connection type: ' + states[networkState]);

			if (
				connection.connection === "none" && localStorage.getItem('uid') !== null
				&& RN.glb.hash!=="notactive"
				&& RN.glb.hash!=="pin"
			) {
				RN.router.navigate('notactive', true);
			};
		}
	}

	return connection;
}