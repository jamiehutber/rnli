module.exports = function () {
	'use strict';

	var notes = {};

	notes.saveLocal = function(data){
		RN.currentTrip.saveLocal('notes', data);
	};

	notes.saveNoteToObject = function(data){
		var singleNote = {},
			note = {},
			localNotes = (typeof localStorage.ctripnotes !== typeof undefined ? JSON.parse(localStorage.ctripnotes) : {});

		if(localNotes !== null){
			singleNote = localNotes
		}

		if(Object.keys(singleNote).length !== 0) {
			note.id = Object.keys(singleNote).length++;
		}else{
			note.id = 0;
		}

		note.date = moment().format('HH:mm');
		note.note = data;
		singleNote[note.id] = note;
		notes.saveLocal(singleNote)
	};

	notes.saveServer = function (data) {
		$.ajax({
			url: RN.glb.url.ajax + 'notes/addNote',
			type: 'POST',
			dataType: 'json',
			data: {
				uid: RN.user.get('uid'),
				note: data
			},
			error: function (data) {
				c('error');
			},
			success: function (data) {
				if (data.error) {
					RN.fnc.popups.message.show(data.error, 'bad');
				} else {
					notes.saveLocal(data);
				}
			}
		});
	};

	return notes;
};