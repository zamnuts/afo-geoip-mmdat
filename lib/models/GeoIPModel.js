var GeoIPModel = function() {
	this.ip				= '';
	this.long			= '';
	this.countryCode	= '';
	this.countryCode3	= '';
	this.countryName	= '';
	this.city			= '';
	this.postalCode		= '';
	this.coordinates	= [];
	this.dmaCode		= '';
	this.areaCode		= '';
	this.region			= '';
	this.organization	= '';
};

module.exports = GeoIPModel;
