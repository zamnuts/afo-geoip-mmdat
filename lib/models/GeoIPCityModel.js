var GeoIPCityModel = function() {
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
};

module.exports = GeoIPCityModel;
