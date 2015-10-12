/**
 * +----------------------------------------------------------------------+
 * | Node.js                                                              |
 * +----------------------------------------------------------------------+
 * | Copyright (C) 2004 MaxMind LLC                                       |
 * +----------------------------------------------------------------------+
 * | This library is free software; you can redistribute it and/or        |
 * | modify it under the terms of the GNU Lesser General Public           |
 * | License as published by the Free Software Foundation; either         |
 * | version 2.1 of the License, or (at your option) any later version.   |
 * |                                                                      |
 * | This library is distributed in the hope that it will be useful,      |
 * | but WITHOUT ANY WARRANTY; without even the implied warranty of       |
 * | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU    |
 * | Lesser General Public License for more details.                      |
 * |                                                                      |
 * | You should have received a copy of the GNU Lesser General Public     |
 * | License along with this library; if not, write to the Free Software  |
 * | Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 |
 * | USA, or view it online at http://www.gnu.org/licenses/lgpl.txt.      |
 * +----------------------------------------------------------------------+
 * | Authors: Jim Winstead <jimw@apache.org> (original Maxmind version)   |
 * |          Hans Lellelid <hans@xmpl.org>                               |
 * |          Andrew Zammit <zammit.andrew@gmail.com> (2015)              |
 * +----------------------------------------------------------------------+
 * | Derived from original source for PHP PEAR's Net_GEOIP v1.0.0 package |
 * | http://pear.php.net/package/Net_GeoIP/                               |
 * +----------------------------------------------------------------------+
 *
 * @package  afo-geoip-mmdat
 * @author   Jim Winstead <jimw@apache.org> (original Maxmind PHP API)
 * @author   Hans Lellelid <hans@xmpl.org>
 * @author   Andrew Zammit <zammit.andrew@gmail.com> (Node.js port, 2015)
 * @license  LGPL http://www.gnu.org/licenses/lgpl.txt
 */

var GeoIPDat,
	GeoIPCityModel		= require('./models/GeoIPCityModel.js'),
	GeoIPCountryModel	= require('./models/GeoIPCountryModel.js'),
	GeoIPOrgModel		= require('./models/GeoIPOrgModel.js'),
	GeoIPRegionModel	= require('./models/GeoIPRegionModel.js'),
	LookupTables		= require('./LookupTables.js'),
	events				= require('events'),
	fs					= require('fs'),
	iconv				= require('iconv-lite'),
	util				= require('util');

var	MM_STR_ENCODING			= 'ISO-8859-1',
	COUNTRY_BEGIN			= 16776960,
	STATE_BEGIN_REV0		= 16700000,
	STATE_BEGIN_REV1		= 16000000,
	STRUCTURE_INFO_MAX_SIZE	= 20,
	COUNTRY_EDITION			= 106,
	REGION_EDITION_REV0		= 112,
	REGION_EDITION_REV1		= 3,
	CITY_EDITION_REV0		= 111,
	CITY_EDITION_REV1		= 2,
	ORG_EDITION				= 110,
	SEGMENT_RECORD_LENGTH	= 3,
	STANDARD_RECORD_LENGTH	= 3,
	ORG_RECORD_LENGTH		= 4,
	MAX_ORG_RECORD_LENGTH	= 300,
	FULL_RECORD_LENGTH		= 50,
	US_OFFSET				= 1,
	CANADA_OFFSET			= 677,
	WORLD_OFFSET			= 1353,
	FIPS_RANGE				= 360;

module.exports = GeoIPDat = function(datPath) {
	this.path			= datPath;
	this.ready			= false;
	this.buffer			= null;
	this.database		= null;
	this.edition		= null;
	this.segments		= 0;
	this.recordLength	= 0;
};

util.inherits(GeoIPDat,events.EventEmitter);

GeoIPDat.prototype.GEOIP_EDITION_ORG		= 1;
GeoIPDat.prototype.GEOIP_EDITION_COUNTRY	= 2;
GeoIPDat.prototype.GEOIP_EDITION_REGION		= 3;
GeoIPDat.prototype.GEOIP_EDITION_CITY		= 4;

GeoIPDat.prototype.load = function(callback) {
	fs.readFile(this.path,function(err,data){
		if ( err ) {
			this.warn('readFile error on '+this.path);
			this.emit('error',this,err);
		} else {
			this.buffer = new Buffer(data);
			try {
				this.determineSegments();
				this.ready = true;
				callback(null,this);
				this.emit('ready',this);
			} catch (e) {
				this.ready = false;
				callback(e,this);
				this.emit('error',this,e);
			}
		}
	}.bind(this));
};

GeoIPDat.prototype.determineSegments = function() {
	this.database = COUNTRY_EDITION;
	this.edition = this.GEOIP_EDITION_COUNTRY;
	this.recordLength = STANDARD_RECORD_LENGTH;
	var offset = 0, // manipulated within incrementOffset()
		incrementOffset = function(length) {
			if ( typeof length === 'undefined' ) {
				length = 1;
			}
			offset += length;
			if ( offset > this.buffer.length ) {
				offset -= this.buffer.length;
			}
			if ( offset < 0 ) {
				offset += this.buffer.length;
			}
		}.bind(this);
	incrementOffset(-3);
	for ( var i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++ ) {
		var delim = this.buffer.slice(offset,offset+3);
		incrementOffset(3);
		if ( delim.readUInt8(0) === 255 && delim.readUInt8(1) === 255 && delim.readUInt8(2) === 255 ) {
			this.database = this.buffer.readUInt8(offset);
			incrementOffset();
			if ( this.database === REGION_EDITION_REV0 ) {
				this.segments = STATE_BEGIN_REV0;
				this.edition = this.GEOIP_EDITION_REGION;
			} else if ( this.database === REGION_EDITION_REV1 ) {
				this.segments = STATE_BEGIN_REV1;
				this.edition = this.GEOIP_EDITION_REGION;
			} else if ( ~[CITY_EDITION_REV0,CITY_EDITION_REV1,ORG_EDITION].indexOf(this.database) ) {
				this.segments = 0;
				this.edition = this.GEOIP_EDITION_CITY;
				var buf = this.buffer.slice(offset,offset+SEGMENT_RECORD_LENGTH);
				for ( var j = 0; j < SEGMENT_RECORD_LENGTH; j++ ) {
					this.segments += buf.readUInt8(j) << (j*8);
					incrementOffset();
				}
				if ( this.database === ORG_EDITION ) {
					this.recordLength = ORG_RECORD_LENGTH;
					this.edition = this.GEOIP_EDITION_ORG;
				}
			}
			break;
		} else {
			incrementOffset(-4);
		}
		if ( this.database === COUNTRY_EDITION ) {
			this.segments = COUNTRY_BEGIN;
			this.edition = this.GEOIP_EDITION_COUNTRY;
		}
	}
};

/**
 * Find and return the country segment offset for an IP address.
 * @param {int} long An IP in its integer format use for the offset lookup.
 * @returns {int|boolean} Returns the offset integer index on success, otherwise boolean false on failure.
 */
GeoIPDat.prototype.findCountrySegmentOffset = function(long) {
	var x,i,j,countryBuffer,depth,
	offset = 0,
	doubleRecordLength = this.recordLength*2;
	for ( depth = 31; depth >= 0; --depth ) {
		try {
			countryBuffer = this.buffer.slice(doubleRecordLength*offset,doubleRecordLength*offset+doubleRecordLength);
			x = [0,0];
			for ( i = 0; i < 2; i++ ) {
				for ( j = 0; j < this.recordLength; j++ ) {
					x[i] += countryBuffer.readUInt8(this.recordLength*i+j) << (j*8);
				}
			}
			if ( (long & (1 << depth)) ) {
				if ( x[1] >= this.segments ) {
					return x[1];
				}
				offset = x[1];
			} else {
				if ( x[0] >= this.segments ) {
					return x[0];
				}
				offset = x[0];
			}
		} catch (e) {
			this.ready = false;
			this.emit('error',this,e);
			break;
		}
	}
	return false;
};

/**
 * Get country information from a long IP.
 * @param {int} long The IP in long integer form.
 * @returns {GeoIPCountryModel}
 */
GeoIPDat.prototype.getCountry = function(long) {
	var model = new GeoIPCountryModel();
	model.long = long;
	if ( this.ready && ~[COUNTRY_EDITION].indexOf(this.database) ) {
		var countrySegment = this.findCountrySegmentOffset(long);
		if ( countrySegment !== false ) {
			var countryId = countrySegment - COUNTRY_BEGIN;
			model = LookupTables.fromCountryIndex(countryId);
		}
	}
	return model;
};

/**
 * Gets the organization/ISP associated with an IP address.
 * @param {int} long The IP in long integer form.
 * @returns {GeoIPOrgModel}
 */
GeoIPDat.prototype.getOrg = function(long) {
	var model = new GeoIPOrgModel();
	model.long = long;
	if ( this.ready && ~[ORG_EDITION].indexOf(this.database) ) {
		var countrySegment = this.findCountrySegmentOffset(long);
		if ( countrySegment !== false && countrySegment !== this.segments ) {
			var slicePoint = countrySegment+(2*this.recordLength-1)*this.segments;
			try {
				var buf = this.buffer.slice(slicePoint,slicePoint+MAX_ORG_RECORD_LENGTH);
				model.organization = bufferToStringUntil(buf,0).str;
			} catch(e) {
				this.ready = false;
				this.emit('error',this,e);
			}
		}
	}
	return model;
};

/**
 * Returns the 2 letter country code and region name for an IP address.
 * @param {int} long The IP in long integer form.
 * @returns {GeoIPRegionModel}
 */
GeoIPDat.prototype.getRegion = function(long) {
	var regionSegment,
		model = new GeoIPRegionModel();
	model.long = long;
	if ( this.ready && this.database === REGION_EDITION_REV0 && (regionSegment = this.findCountrySegmentOffset(long)) !== false ) {
		regionSegment -= STATE_BEGIN_REV0;
		if ( regionSegment >= 1000 ) {
			model.countryCode = 'US';
			model.region = String.fromCharCode((regionSegment-1000)/26+65) + String.fromCharCode((regionSegment-1000)%26+65);
		} else {
			model.countryCode = LookupTables.CountryCodes[regionSegment];
			model.region = '';
		}
	} else if ( this.ready && this.database === REGION_EDITION_REV1 && (regionSegment = this.findCountrySegmentOffset(long)) !== false ) {
		regionSegment -= STATE_BEGIN_REV1;
		if ( regionSegment < US_OFFSET ) {
			model.countryCode = '';
			model.region = '';
		} else if ( regionSegment < CANADA_OFFSET ) {
			model.countryCode = 'CA';
			model.region = String.fromCharCode((regionSegment-US_OFFSET)/26+65) + String.fromCharCode((regionSegment-US_OFFSET)%26+65);
		} else if ( regionSegment < WORLD_OFFSET ) {
			model.countryCode = 'CA';
			model.region = String.fromCharCode((regionSegment-CANADA_OFFSET)/26+65) + String.fromCharCode((regionSegment-CANADA_OFFSET)%26+65);
		} else {
			model.countryCode = LookupTables.CountryCodes[(regionSegment-WORLD_OFFSET)/FIPS_RANGE]||'';
			model.region = '';
		}
	}
	return model;
};

/**
 * Get detailed information (city level) for an IP address.
 * @param {int} long The IP in long integer form.
 * @returns {GeoIPCityModel}
 */
GeoIPDat.prototype.getCity = function(long) {
	var model = new GeoIPCityModel();
	model.long = long;
	if ( this.ready && ~[CITY_EDITION_REV0,CITY_EDITION_REV1].indexOf(this.database) ) {
		var countrySegment = this.findCountrySegmentOffset(long);
		if ( countrySegment !== false && countrySegment !== this.segments ) {
			try {
				var i,
				bufPos = 0,
				recordPointer = countrySegment+(2*this.recordLength-1)*this.segments,
				buf = this.buffer.slice(recordPointer,recordPointer+FULL_RECORD_LENGTH);
				
				// get country
				var countryId = buf.readUInt8(bufPos),
					countryModel = LookupTables.fromCountryIndex(countryId);
				model.countryCode	= countryModel.countryCode;
				model.countryCode3	= countryModel.countryCode3;
				model.countryName	= countryModel.countryName;
				bufPos++;
				
				// get region
				var regionObj = bufferToStringUntil(buf,0,bufPos);
				model.region = regionObj.str;
				bufPos += regionObj.bytes + 1;
				
				// get city
				var cityObj = bufferToStringUntil(buf,0,bufPos);
				model.city = cityObj.str;
				bufPos += cityObj.bytes + 1;
				
				// get postal code
				var postalObj = bufferToStringUntil(buf,0,bufPos);
				model.postalCode = postalObj.str;
				bufPos += postalObj.bytes + 1;
				
				// get latitude
				var latitude = 0;
				for ( i = 0; i < 3; i++ ) {
					latitude += buf.readUInt8(bufPos++) << (i*8);
				}
				latitude = parseFloat(((latitude/10000) - 180).toFixed(4));
				
				// get longitude
				var longitude = 0;
				for ( i = 0; i < 3; i++ ) {
					longitude += buf.readUInt8(bufPos++) << (i*8);
				}
				longitude = parseFloat(((longitude/10000) - 180).toFixed(4));
				
				model.coordinates = [longitude,latitude];
				
				// get area code and DMA (if available)
				if ( this.database === CITY_EDITION_REV1 && model.countryCode.toUpperCase() === 'US' ) {
					var dmaAreaCombo = 0;
					for ( i = 0; i < 3; i++ ) {
						dmaAreaCombo += buf.readUInt8(bufPos++) << (i*8);
					}
					model.dmaCode = Math.floor(dmaAreaCombo/1000);
					model.areaCode = dmaAreaCombo%1000;
				}
			} catch(e) {
				this.ready = false;
				this.emit('error',this,e);
			}
		}
	}
	return model;
};

var BufferStringModel = function() {};
BufferStringModel.prototype = {
	str: '',
	bytes: 0
};

/**
 * Create a utf8 string from a buffer up until a given stop code with an optional starting offset.
 * @param {Buffer} buf The buffer in question
 * @param {int} stopCode The byte to look for. Will construct a string up until this internal stop code.
 * @param {int} [startIndex=0] An optional index to start at within the `buf`
 * @returns {BufferStringModel}
 */
function bufferToStringUntil(buf,stopCode,startIndex) {
	var model = new BufferStringModel();
	if ( typeof startIndex !== 'number' ) {
		startIndex = 0;
	}
	var i = startIndex;
	for ( ; i < buf.length; i++ ) {
		if ( buf.readUInt8(i) === stopCode ) {
			break;
		}
	}
	if ( startIndex < i ) {
		try {
			model.str = iconv.encode(iconv.decode(buf.slice(startIndex,i),MM_STR_ENCODING),'utf8').toString('utf8');
		} catch(e) {
			model.str = buf.toString('utf8',startIndex,i);
		}
		model.bytes = i-startIndex;
	}
	return model;
}
