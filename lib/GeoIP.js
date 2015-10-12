var GeoIP,
	GeoIPModel		= require('./models/GeoIPModel.js'),
	GeoIPDat		= require('./GeoIPDat.js'),
	async			= require('async'),
	events			= require('events'),
	fs				= require('fs'),
	path			= require('path'),
	util			= require('util'),
	l				= require('lodash');

module.exports = GeoIP = function(config) {
	this.config = l.merge({
		datPath: path.resolve('./dat'),
		log: console,
		fileRegex: /\.dat$/i
	},config);
	this.log = this.config.log;
	this.datCache = [];
	this.reloadDatCache();
};

util.inherits(GeoIP, events.EventEmitter);

GeoIP.prototype.ERROR_GENERIC				= 500;
GeoIP.prototype.ERROR_FS_DATEXISTS			= 501;
GeoIP.prototype.ERROR_FS_DATTRAVERSE		= 502;
GeoIP.prototype.ERROR_DAT_PARSE				= 503;
GeoIP.prototype.OK_GENERIC					= 200;
GeoIP.prototype.OK_FS_DATLOADED				= 201;

GeoIP.prototype._refreshDatCache = function() {
	this.datCache = this.datCache.filter(function(item){
		return item.ready;
	}).sort(function(a,b){
		return a.edition - b.edition;
	});
};

GeoIP.prototype.reloadDatCache = function() {
	var newDatCache = [];
	fs.exists(this.config.datPath,function(exists){
		if ( !exists ) {
			this.emit('error',this.ERROR_FS_DATEXISTS,this.config.datPath);
			return;
		}
		fs.readdir(this.config.datPath,function(err,files){
			if ( err ) {
				this.emit('error',this.ERROR_FS_DATTRAVERSE,this.config.datPath);
				return;
			}
			var loadedDats = 0,
				onDatReady = function(geoipDat) {
					this.log.log('Loaded Dat #'+(loadedDats+1)+' at '+geoipDat.path);
					loadedDats++;
				}.bind(this),
				onceDatError = function(geoipDat) {
					geoipDat.removeListener('ready',onDatReady);
					loadedDats++;
				}.bind(this),
				onDatError = function(geoipDat,err) {
					this.log.warn('Dat error for '+geoipDat.path,err,err.stack);
					this._refreshDatCache();
					this.emit('error',this.ERROR_DAT_PARSE,err);
				}.bind(this);
			async.eachSeries(files,function(file,cbAsync) {
				var datPath = this.config.datPath+path.sep+file;
				if ( typeof file !== 'string' || !file.match(this.config.fileRegex) ) {
					 this.log.warn('Skipping file #'+(loadedDats+1)+' at '+datPath);
					 loadedDats++;
					 cbAsync();
					 return;
				 }
				var dat = new GeoIPDat(datPath);
				dat.once('ready',onDatReady);
				dat.once('error',onceDatError);
				dat.on('error',onDatError);
				newDatCache.push(dat);
				dat.load(function() {
					cbAsync();
				});
			}.bind(this),function() {
				this.datCache = newDatCache;
				this._refreshDatCache();
				this.emit('loaded',this.OK_FS_DATLOADED,this.datCache.length,loadedDats); // function(code,numLoadedOk,numLoadedTried)
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

GeoIP.prototype.lookup = function(ip,callback) {
	var result	= new GeoIPModel(),
		lookup	= false,
		longIp	= this.ip2long(ip);
	if ( result.long !== false ) {
		this.datCache.forEach(function(dat){
			var method = null;
			switch ( dat.edition ) {
				case dat.GEOIP_EDITION_CITY:	method = 'getCity';		break;
				case dat.GEOIP_EDITION_REGION:	method = 'getRegion';	break;
				case dat.GEOIP_EDITION_COUNTRY:	method = 'getCountry';	break;
				case dat.GEOIP_EDITION_ORG:		method = 'getOrg';		break;
			}
			if ( method && dat[method]) {
				lookup = dat[method](longIp);
				if ( lookup.long === longIp ) {
					for ( var i in result ) {
						if ( result.hasOwnProperty(i) && typeof result[i] === typeof lookup[i] && lookup[i] ) {
							result[i] = lookup[i];
						}
					}
				}
			}
		});
	}
	result.ip	= ip;
	result.long	= longIp;
	callback(!lookup,result);
};

GeoIP.prototype.ip2long = function(ip) {
	var i,
		parts = ip.split('.'),
		result = 0;
	if ( parts.length !== 4 ) {
		return false;
	}
	for ( i = 3; i >= 0; i-- ) {
		if ( parts[i] > 255 || parts[i] < 0 ) {
			return false;
		}
		result += parseInt(parts[i],10)*Math.pow(2,(3-i)*8);
	}
	return result;
};

GeoIP.prototype.long2ip = function(long) {
	if ( long < 0 || long > 4294967295 ) {
		return false;
	}
	return [
		long >>> 24,
		long >>> 16 & 0xFF,
		long >>> 8 & 0xFF,
		long & 0xFF
	].join('.');
};
