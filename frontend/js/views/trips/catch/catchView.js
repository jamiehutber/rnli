'user strict';

//extend the view with the default home view
module.exports = RN.glb.gvCreator.extend({
	el: '.content',

	templates: {
		home: require('../../../../views/trips/catch/catch.jade'),
	},

	events: {
	},

	render: function () {
		var self = this;
		//load data in ejs
		this.$el.html(this.templates.home());
	}
});