casper.start('http://localhost:8000/'); //replace with http://localhost:8000/ to test local code

casper.then(function() {
	this.echo(this.getCurrentUrl());
	this.test.assertHttpStatus(200, + 'site is up');
	this.test.assertExists("#guest_login");
});

casper.thenClick("#guest_login",function(){
	this.echo(this.getCurrentUrl());
});

casper.then(function() {
	this.echo(this.getCurrentUrl());
	this.test.assertUrlMatch('http://localhost:8000/#/search');
	casper.waitForSelector('#username_or_email', function() {
	    this.echo(this.getCurrentUrl());
	});
});

casper.run();