jQuery.fn.isInViewport = function () {
	var elementTop = jQuery(this).offset().top;
	var elementBottom = elementTop + jQuery(this).outerHeight(); var viewportTop = jQuery(window).scrollTop();
	var viewportBottom = viewportTop + jQuery(window).height(); return elementBottom > viewportTop && elementTop < viewportBottom;
};
var ts_reading_progress = {
	isComplete: false,
	percent: 0,
	enabled: true,
};
ts_reading_progress.run = function () {
	if ( ! this.enabled) return;
	jQuery(window).on("scroll", function () {
		var scrollVal = jQuery(this).scrollTop();
		var scrollEl = jQuery("#readerarea");
		var scrollElVal = scrollEl.outerHeight(true);
		var progressBar = jQuery(".readingprogress");
		var floatEl = jQuery('.readingnav');
		var entryTitle = jQuery('h1.entry-title');

		if (scrollEl.length < 1) return;
		if (progressBar.length < 1) return;
		if (floatEl.length < 1) return;

		if (scrollVal > 180 && entryTitle.isInViewport() == false && ts_reading_progress.isComplete === false) {
			floatEl.fadeIn();
		} else {
			floatEl.fadeOut();
		}

		//if cbot in viewport 
		if (jQuery(".cbot").isInViewport()) {
			ts_reading_progress.isComplete = false;
			progressBar.css("width", "100%");
			return;
		}

		var sot = scrollEl.offset().top;
		if (scrollVal >= sot) {
			if (scrollVal <= sot + scrollElVal) {
				var percent = (scrollVal - sot) / (scrollElVal - document.documentElement.clientHeight) * 100;
				if (percent >= 100) {
					percent = 100;
					ts_reading_progress.isComplete = true;
				} else {
					ts_reading_progress.isComplete = false;
				}
				progressBar.css("width", percent + "%");

			} else {
				progressBar.css("width", "100%");
				floatEl.fadeOut(function () {
					jQuery("body").removeClass('hidenopt');
				});
				ts_reading_progress.isComplete = true;
			}
		} else {
			progressBar.css("width", "0px");

		}
	});
}

//HERE IS THE CONTROL OBJECT

var ts_reader_control = {
	"readingMode": "full",
	"defaultReadingMode": "full",
	"availableReadingMode": ["single", "full"],
	"readingModeLatestIndex": 0,
	"images": {},
	"beforeImages": [],
	"afterImages": [],
	"imageSource": "Default",
	"noImageHtml": "<h2>NO IMAGES</h2>",
	"scrollSpyDomCache": null,
	"lazyload": false,
	"lazyloadPlaceHolder": false,
	"prevEnded": false,
	"nextEnded": false,
	"singleOnSetImageScrollEl": ".maincontent",
    "protected": false,
};
ts_reader_control.preloading = {
	"element": "#readerarea-loading",
	"hide": function () { 
		if (this.lazyload) return;
		jQuery(this.element).fadeOut(); 
	},
	"show": function () { 
		jQuery(this.element).show(); 
	},
};
ts_reader_control.stripNonAlphaNum = function(s){
	return s.replace(/[^A-Za-z0-9]/g, '');
}
ts_reader_control.setReadingMode = function (mode) {
	if (!mode) mode = this.defaultReadingMode;
	if (this.availableReadingMode.indexOf(mode) === -1) {
		mode = this.defaultReadingMode;
	}
	this.readingMode = mode;
	ts_localStorage.setLocalStorage(ts_reader.readingModeLsName, mode);
	if (jQuery('#readingmode').val() != mode) jQuery('#readingmode').val(mode);
}
ts_reader_control.getReadingMode = function () {
	var mode = this.readingMode;
	if (this.availableReadingMode.indexOf(mode) === -1) {
		mode = this.defaultReadingMode;
	}
	return mode;
}
ts_reader_control.setImageSource = function (source) {
	if (!source) return;
	this.imageSource = this.stripNonAlphaNum(source);
}
ts_reader_control.setImageSourceIfExists = function(source){
	if (source in this.images == false) return;
	this.setImageSource(source);
	jQuery("select.mirror-selector").val(this.imageSource);
}
ts_reader_control.setSources = function (sources) {
	for (var i in sources) {
		var item = sources[i];
		if (!item.source) continue;
		if (!item.images.length) continue;
		this.setImages(item.images, item.source);
	}
}
ts_reader_control.setImages = function (images, source) {
	if (!source) source = this.imageSource;
	source = this.stripNonAlphaNum(source);
	this.images[source] = images;
}
ts_reader_control.getImages = function (source) {
	if (!source) source = this.imageSource;
	if (!this.images) return [];
	if (source in this.images === false) return [];
	return this.images[source];
}
ts_reader_control.esc_attr = function(s, preserveCR){
	preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
		.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
		.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		/*
		You may add other replacements here for HTML only 
		(but it's not necessary).
		Or for XML, only if the named entities are defined in its DTD.
		*/ 
		.replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
		.replace(/[\r\n]/g, preserveCR);
}
ts_reader_control.createImageTag = function (image, index, server, onload) {
	if (index && !isNaN(index)) {
		index = ' data-index="' + index + '"';
	} else {
		index = "";
	}
	if (server && typeof (server) === "string") {
		server = " data-server='" + server + "'";
	} else {
		server = "";
	}
	var imageSrc = image;
	if (this.lazyload && this.getReadingMode() != "single"){
		var lazyload = " data-src='" + this.esc_attr(image) + "'";
		var lazyclass = " lazy";
		if (this.lazyloadPlaceHolder){
			imageSrc = this.lazyloadPlaceHolder;
		}else{
			imageSrc = "";
		}
	}else{
		var lazyload = "";
		var lazyclass = "";
	}
	if (imageSrc){
		imageSrc = " src='"+this.esc_attr(imageSrc)+"'";
	}
	if (onload && typeof (onload) === "string") {
		onload = " onload='" + onload + "'";
		onload = onload + " onerror='ts_reader_control.imageOnError();'";
	} else {
		onload = "";
	}
	image = "<img class='ts-main-image"+lazyclass+"'"+index+''+imageSrc+''+lazyload+''+server+''+onload+"/>";
	return image;
}
ts_reader_control.imageSourceExists = function(source){
	var s = Object.keys(this.images);
	return s.indexOf(source) !== -1;
}
ts_reader_control.getOneSource = function(){
	var s = Object.keys(this.images);
	if (s.length < 1) return;
	return s[0];
}
ts_reader_control.showImage = function (source) {
	if (!source) source = this.imageSource;
	if ( ! this.imageSourceExists(source)){
		source = this.getOneSource();
		this.imageSource = source;
	}
	var images = this.getImages(source);
	if (images.length < 1) {
		ts_reader_control.preloading.hide();
		var msg = this.noImageHtml.replace(/<script/gi, '<x-s').replace(/<\/script/gi, '</x-s');
		return jQuery("#readerarea").html(msg);
	}
	this.setImageSource(source);
	if (this.getReadingMode() == "full") {
		var imagesToShow = images;
	} else {
		imagesToShow = [images[this.readingModeLatestIndex]];
	}
	ts_reader_control.putImages(imagesToShow);
}
ts_reader_control.putImages = function (arrayOfImages) {
	var html = [];
	for (var i in arrayOfImages) {
		var image = arrayOfImages[i];
		var onload = "";
		if (i == 0) {
			onload = "ts_reader_control.singleImageOnload();";
		}
		html.push(this.createImageTag(image, i, this.imageSource, onload));
	}
	beforeImages = this.beforeImages.join('');
	afterImages = this.afterImages.join('');
	jQuery("#readerarea").html(beforeImages + html.join("") + afterImages);
	this.updateLazyLoad();
	this.buildSelectPaged();
	this.scrollSpyDomCache = null;
}
ts_reader_control.updateLazyLoad = function(){
	if ( ! this.lazyload) return;
	var myLazyLoad = new LazyLoad({});
	myLazyLoad.update();
}
ts_reader_control.showNextImage = function () {
	if (this.getReadingMode() != "single") return;
	var images = this.getImages(this.imageSource);
	var currentIndex = this.readingModeLatestIndex;
	var nextIndex = currentIndex + 1;
	if (nextIndex >= images.length) return this.nextChapter();
	this.showImageAtIndex(nextIndex);
}
ts_reader_control.showPrevImage = function () {
	if (this.getReadingMode() != "single") return;
	var currentIndex = this.readingModeLatestIndex;
	var prevIndex = currentIndex - 1;
	if (prevIndex < 0) return this.prevChapter();
	this.showImageAtIndex(prevIndex);
}
ts_reader_control.showImageAtIndex = function (index) {
	if (this.getReadingMode() != "single") return;
	if (!index && index !== 0) return;
	var images = this.getImages(this.imageSource);
	index = parseInt(index);
	if (index >= images.length) return;
	var image = images[index];
	var newImgTag = this.createImageTag(image, index, this.imageSource, "ts_reader_control.singleImageOnload();");
	jQuery("#readerarea").html(newImgTag);
	ts_reader_control.preloading.show();
	this.readingModeLatestIndex = index;
	jQuery(".ts-select-paged").val(index);
	setTimeout(function () {
		jQuery(ts_reader_control.singleOnSetImageScrollEl).get(0).scrollIntoView({
			behavior: "smooth",
		});
	}, 200);
	ts_reader_control.prevNextInit();

}
ts_reader_control.preloadNextImage = function () {
	if (this.getReadingMode() != "single") return;
	var currentIndex = this.readingModeLatestIndex;
	var nextIndex = currentIndex + 1;
	var images = this.getImages(this.imageSource);
	if (nextIndex >= images.length) return;
	var image = images[nextIndex];
	this.bgLoadImage(image);
}
ts_reader_control.preloadAllImage = function(){
	if (this.getReadingMode() != "full") return;
	if (this.lazyload == false) return;
	if(document.readyState === 'complete') {
		this.bgLoadAllImages(0);
	} else {
		document.onreadystatechange = function () {
			if (ts_reader_control.getReadingMode() != "full") return;
			if (document.readyState == "complete") {
				ts_reader_control.bgLoadAllImages(0);
			}
		}
	}
}
ts_reader_control.bgLoadAllImages = function(index, cb){
	if (typeof(cb) != "function") cb = new Function;
	var images = this.getImages();
	if ( ! index) index = 0;
	if (index >= images.length) return cb();
	this.bgLoadImage(images[index], function(status){
		ts_reader_control.bgLoadAllImages(index+1);
	});
}
ts_reader_control.bgLoadImage = function(src, cb){
	var imageObject = new Image;
	imageObject.src = src;
	if (typeof(cb) == 'function'){
		imageObject.onload = function(){
			return cb(true);
		}
		imageObject.onerror = function(){
			return cb(false);
		}
	}
}
ts_reader_control.singleImageOnload = function () {
	var remo = this.getReadingMode();
	this.preloading.hide();
	if (remo == "single") this.preloadNextImage();
	if (remo == "full") this.preloadAllImage();
}
ts_reader_control.imageOnError = function(){
	this.preloading.hide();
}
ts_reader_control.nextChapter = function () {
	if (this.nextChapterUrl) {
		window.location.assign(this.nextChapterUrl);
		return false;
	}
	this.prevNextInit();
}
ts_reader_control.prevChapter = function () {
	if (this.prevChapterUrl) {
		window.location.assign(this.prevChapterUrl);
		return false;
	}
	this.prevNextInit();
}
ts_reader_control.prevNextInit = function () {
	if (ts_reader_control.getReadingMode() == "full") {
		if (!this.nextChapterUrl){
			jQuery(".ch-next-btn").addClass('disabled');
		}else{
			jQuery(".ch-next-btn").removeClass('disabled');
			jQuery(".ch-next-btn").attr('href', this.nextChapterUrl);
		}
		if (!this.prevChapterUrl) {
			jQuery(".ch-prev-btn").addClass('disabled');
		}else{
			jQuery(".ch-prev-btn").removeClass('disabled');
			jQuery(".ch-prev-btn").attr('href', this.prevChapterUrl);
		}
		
		
	} else {
		var images = this.getImages(this.imageSource);
		if (this.readingModeLatestIndex === 0 && !this.prevChapterUrl) {
			jQuery(".ch-prev-btn").addClass('disabled');
			this.prevEnded = true;
		} else {
			jQuery(".ch-prev-btn").removeClass('disabled');
			this.prevEnded = false;
		}
		if (this.readingModeLatestIndex >= (images.length - 1) && !this.nextChapterUrl) {
			jQuery(".ch-next-btn").addClass('disabled');
			this.nextEnded = true;
		} else {
			jQuery(".ch-next-btn").removeClass('disabled');
			this.nextEnded = false;
		}
		if (this.readingModeLatestIndex === 0 && this.prevChapterUrl){
			jQuery(".ch-prev-btn").attr('href', this.prevChapterUrl);
		}else{
			jQuery(".ch-prev-btn").attr('href', "#/");
		}
		if (this.readingModeLatestIndex >= (images.length - 1) && this.nextChapterUrl) {
			jQuery(".ch-next-btn").attr('href', this.nextChapterUrl);
		}else{
			jQuery(".ch-next-btn").attr('href', "#/");
		}
	}
}
ts_reader_control.buildSelectPaged = function (source) {
	if (!source) source = this.imageSource;
	var images = this.getImages(source);
	var selectPaged = [];
	for (var i in images) {
		var showIndex = parseInt(i) + 1;
		selectPaged.push('<option value="'+i+'">'+showIndex+'/'+images.length+'</option>');
		//selectPaged.push(`<option value="${i}">${showIndex}/${images.length}</option>`);
	}
	jQuery(".ts-select-paged").html(selectPaged.join(""));
	ts_reader_control.scrollSpy();
}
ts_reader_control.buildMirrorSelector = function(){
	var sources = ts_reader.params.sources;
	if (sources.length < 2) return;
	var html = "";
	for(var i of sources){
		if (this.stripNonAlphaNum(i.source) === ts_reader_control.imageSource){
			var selected = " selected='selected'"
		}else{
			var selected = "";
		}
		var tpl = '<option value="' + this.stripNonAlphaNum(i.source) + '"' + selected + '>' + this.esc_attr(i.source) + '</option>';
		html += tpl;
	}
	if (html){
		jQuery('select.mirror-selector').html(html);
		jQuery('.mirror-select.mirror.l').show();
		jQuery('.chnav.nomirror').removeClass('nomirror');
	}
}
ts_reader_control.scrollSpy = function () {
	var selects = jQuery(".ts-select-paged");
	var currentIndex = null;
	var timeout = null;
	window.onscroll = function () {
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			if (ts_reader_control.getReadingMode() == "single") return;
			if (ts_reader_control.scrollSpyDomCache) {
				sections = ts_reader_control.scrollSpyDomCache;
			} else {
				var sections = document.querySelectorAll('.ts-main-image');
				ts_reader_control.scrollSpyDomCache = sections;
			}
			var scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
			for (var s in sections) {
				if (sections.hasOwnProperty(s) && sections[s].offsetTop <= scrollPos) {
					var id = sections[s].getAttribute('data-index');
					if (currentIndex != id) {
						selects.val(id);
						currentIndex = id;
					}
				} else {
					break;
				}
			}
		}, 100);
	}
}
ts_reader_control.attach_events = function () {
    this.attach_events = function(){};
	jQuery("body").on("click", function (e) {
		if (jQuery(".readingnav").css('display') == "none") return;
		var floatSelects = jQuery(e.target).closest('.selectorx').length;
		if (floatSelects) return;
		var nextprev = jQuery(e.target).closest('.btm-np').length;
		if (nextprev) return jQuery(this).removeClass('hidenopt');
		var ctop = jQuery(e.target).closest('.ctop').length;
		if (ctop) return jQuery(this).addClass('hidenopt');
		var cbot = jQuery(e.target).closest('.cbot').length;
		if (cbot) return jQuery(this).addClass('hidenopt');
		return jQuery(this).toggleClass('hidenopt');
	});
	jQuery("body").on('change', ".ts-select-paged", function () {
		if (ts_reader_control.getReadingMode() == "full") {
			var index = this.value;
			if (isNaN(index)) return false;
			var imageElement = jQuery("#readerarea").find("img.ts-main-image[data-index=" + index + "]");
			if (imageElement.length < 1) return false;
			imageElement.get(0).scrollIntoView({
				behavior: "smooth",
			});
			ts_reader_control.prevNextInit();
			return true;
		} else {
            ts_reader_control.showImageAtIndex(this.value);
		}
	});
	jQuery("#readingmode").on("change", function () {
		ts_reader_control.setReadingMode(this.value);
		ts_reader_control.readingModeLatestIndex = 0;
        ts_reader_control.showImage();
        ts_reader_control.prevNextInit();
	});
	jQuery(".readercontent").on('click', 'a.ch-next-btn', function () {
		if (jQuery(this).hasClass('disabled')) return false;
		if (ts_reader_control.getReadingMode() == "full") {
			return ts_reader_control.nextChapter();
		}
        ts_reader_control.showNextImage();
        return false;
	});
	jQuery(".readercontent").on('click', 'a.ch-prev-btn', function () {
		if (jQuery(this).hasClass('disabled')) return false;
		if (ts_reader_control.getReadingMode() == "full") {
			return ts_reader_control.prevChapter();
		}
        ts_reader_control.showPrevImage();
        return false;
	});
	jQuery("#readerarea").on('click', 'img.ts-main-image', function () {
		return false;
	});
	jQuery("#readerarea").on('contextmenu', 'img.ts-main-image', function () {
		return false;
	});
	ts_image_control.attach_events();
	ts_reader_control.nextPrevListener();
	ts_reader_control.mirrorChangeListener();
}
ts_reader_control.nextPrevListener = function(){
	ts_reader_control.nextPrevListener = function(){};
	jQuery(window).on("keydown", function (e) {
		var keyCode = 0;
		if (navigator.appName == "Microsoft Internet Explorer") {
			if (!e) {
				var e = window.event;
			}
			if (e.keyCode) {
				keyCode = e.keyCode;
				if ((keyCode == 37) || (keyCode == 39)) {
					window.event.keyCode = 0;
				}
			} else {
				keyCode = e.which;
			}
		} else {
			if (e.which) {
				keyCode = e.which;
			} else {
				keyCode = e.keyCode;
			}
		}
		switch (keyCode) {
			case 39:
				if (ts_reader_control.getReadingMode() == "single" && ts_reader.params.contentmode == "advanced") {
					ts_reader_control.showNextImage();
				} else {
					window.location.assign(ts_reader_control.nextChapterUrl);
				}
				return false;
			case 37:
				if (ts_reader_control.getReadingMode() == "single"  && ts_reader.params.contentmode == "advanced") {
					ts_reader_control.showPrevImage();
				} else {
					window.location.assign(ts_reader_control.prevChapterUrl);
				}
				return false;
			default:
				return true;
		}
	});
}
ts_reader_control.mirrorChangeListener = function(){
	ts_reader_control.mirrorChangeListener = function(){};
	jQuery("select.mirror-selector").on("change", function () {
		var cleanValue = ts_reader_control.stripNonAlphaNum(this.value);
		ts_reader_control.setImageSource(cleanValue);
		ts_reader_control.readingModeLatestIndex = 0;
		ts_reader_control.showImage();
		jQuery("select.mirror-selector").val(cleanValue);
		ts_localStorage.setLocalStorage(ts_reader.imageSourceLsName, cleanValue);
		ts_reader_control.preloading.show();
		setTimeout(function(){
			var img = jQuery("#readerarea").find("img.ts-main-image");
			if (img.length < 1) return;
			img.get(0).scrollIntoView({
				behavior: "smooth",
			});
		}, 200);
	});
}

var ts_image_control = {
	"maxLeftPos": 0.40,
	"fullPageClickScroll": 500,
};
ts_image_control.setPointer = function (el, event) {
	var t = jQuery(el);
	if (ts_reader_control.getReadingMode() != "single") {
		if (t.hasClass('curdown')) return;
		t.addClass("curdown");
		return;
	}
	var x = event.pageX - t.offset().left;
	if (x < el.width * ts_image_control.maxLeftPos) {
		if (t.hasClass('curleft')) return;
		t.removeClass("curright");
		if ( ! ts_reader_control.prevEnded)t.addClass("curleft");
	} else {
		if (t.hasClass('curright')) return;
		t.removeClass("curleft");
		if ( ! ts_reader_control.nextEnded) t.addClass("curright");
	}
}
ts_image_control.attach_events = function () {
    this.attach_events = function(){};
	jQuery("#readerarea").on("click", 'img.ts-main-image', function (event) {
		if (ts_reader_control.getReadingMode() != "single" && "handleObj" in event && "type" in event.handleObj && event.handleObj.type === "click") {
			jQuery('html, body').animate({
				scrollTop: jQuery(document).scrollTop() + ts_image_control.fullPageClickScroll,
			}, 200);
			return;
		}
		var x = event.pageX - jQuery(this).offset().left;
		if (x < this.width * ts_image_control.maxLeftPos) {
			ts_reader_control.showPrevImage();
		} else {
			ts_reader_control.showNextImage();
		}
	});
	jQuery("#readerarea").on("mousemove", 'img.ts-main-image', function (event) {
		ts_image_control.setPointer(this, event);
	});
	jQuery("#readerarea").on("mouseenter", 'img.ts-main-image', function (event) {
		ts_image_control.setPointer(this, event);
	});
}

var ts_reader = {};
ts_reader.readingModeLsName = "tsms_readingmode";
ts_reader.imageSourceLsName = "tsms_lastsource";
ts_reader.defaultContentMode = "advanced";
ts_reader.params = {};
ts_reader.run = function(param){
	this.params = param;
	var mode = param.contentmode || this.defaultContentMode;
    if (param.protected) return this.protectedMode();
	if (mode === "minimal") return this.minimalMode();
	return this.advancedMode();
}
ts_reader.protectedMode = function(){
	var param = this.params;
	ts_reader_control.nextChapterUrl = param.nextUrl;
	ts_reader_control.prevChapterUrl = param.prevUrl;
	ts_reader_control.prevNextInit();
}
ts_reader.advancedMode = function(){
	var param = this.params;
	var lastReadingMode = ts_localStorage.getLocalStorage(this.readingModeLsName);
	var selectedSource = ts_localStorage.getLocalStorage(this.imageSourceLsName);
	ts_reader_control.noImageHtml = param.noimagehtml;
	ts_reader_control.nextChapterUrl = param.nextUrl;
	ts_reader_control.prevChapterUrl = param.prevUrl;
	ts_reader_control.imageSource = param.defaultSource;
	ts_reader_control.lazyload = param.lazyload;
	ts_reader_control.lazyloadPlaceHolder = param.lazyloadPlaceHolder;
	ts_reader_control.setReadingMode(lastReadingMode?lastReadingMode:param.mode);
	ts_reader_control.setSources(param.sources);
	ts_reader_control.setImageSourceIfExists(selectedSource);
	ts_reader_control.preloading.show();
	ts_reader_control.showImage();
	ts_reader_control.attach_events();
	ts_reader_control.prevNextInit();
	ts_reading_progress.enabled = param.progressBar || true;
	ts_reading_progress.run();
}
ts_reader.minimalMode = function(){
	var param = this.params;
	//var selectedSource = ts_localStorage.getLocalStorage(this.imageSourceLsName);
	ts_reader_control.nextChapterUrl = param.nextUrl;
	ts_reader_control.prevChapterUrl = param.prevUrl;
	ts_reader_control.imageSource = param.defaultSource;
	//ts_reader_control.noImageHtml = param.noimagehtml;
	ts_reader_control.setSources(param.sources);
	//ts_reader_control.setImageSourceIfExists(selectedSource);
	ts_reader_control.preloading.hide();
	ts_reader_control.setReadingMode("full");
	//ts_reader_control.showImage();
	ts_reader_control.prevNextInit();
	ts_reader_control.nextPrevListener();
	ts_reader_control.mirrorChangeListener();
	ts_reading_progress.enabled = false;
	ts_reading_progress.run();
	
}