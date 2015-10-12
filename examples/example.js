var GeoIP	= require('../index.js'),
	async	= require('async');

var ipList = [
	'207.97.227.239', // San Antonio, TX, US (Rackspace)
	'181.129.162.251', // Medellín, Columbia (UTF-8) (UNE)
	'68.14.229.34', // Tempe, AZ, US (Cox Communications)
	'8.8.8.8',
	'198.27.94.33',
	'166.78.252.134'
];

var geoip = new GeoIP({
		datPath: require('path').resolve('./dat'),
		log: console
	});

geoip.on('error',function(){
	console.warn('geoip.error',arguments);
});

var reloadCount = 0;
geoip.on('loaded',function onGeoIPLoaded(){
	console.info('geoip.loaded');
	if ( ++reloadCount > 3 ) {
		geoip.removeListener('loaded',onGeoIPLoaded);
	}
	async.each(ipList,function(item,cbAsync){
		geoip.lookup(item,function(err,result) {
			if ( err ) {
				console.warn('There was an error looking up IP "'+item+'": ',JSON.stringify(arguments));
			} else {
				console.info('Success: ',JSON.stringify(result));
			}
			cbAsync();
		});
	},function() {
		geoip.datCache.forEach(function(dat,i) {
			console.info('Dat cache #%d: %s',i,dat.path,dat.ready);
		});
		setTimeout(function() {
			geoip.reloadDatCache();
		},1000*3);
	});
});
