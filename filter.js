$(document).on('click','.quickfilter .dropdown-toggle',function(){
	if(!$(this).parent().hasClass('open')) {
		$(document).find('.quickfilter .filter.dropdown').removeClass('open');
	}
	$(this).parent().toggleClass('open');
});
$(document).on("click", function(event){
	if(!$(event.target).closest(".dropdown-toggle").length){
		$(document).find('.quickfilter .filter.dropdown').removeClass('open');
	}
});
jQuery(document).ready(function($) {
	$('.filters .filter ul').click(function(event) {
		event.stopPropagation();
	});
	$('.filters .filter ul').each(function(index, elem) {
		var elem_checked = $(this).find('input:checked');
		var button_span = elem_checked.closest('.filter').find("button span");
		if (elem_checked.length == 1) {
			button_span.html(elem_checked.parent().find("label").html());
		} else if (elem_checked.length > 1) {
			button_span.html(elem_checked.length + ' selected');
		} else if (elem_checked.length == 0) {
			button_span.html('All');
		}
	});
	$('.dropdown-menu input').on('click', function(e) {
		if (jQuery(this).hasClass('genre-item')) {
			ts_fs_genre_item.handle(this);
			return;
		}
		var ul_elem = $(this).parent().parent();
		var elem_checked = ul_elem.find("input:checked");
		var button_span = ul_elem.parent().find("button span");
		if (elem_checked.length == 1) {
			button_span.html(elem_checked.parent().find("label").html());
		} else if (elem_checked.length > 1) {
			button_span.html(elem_checked.length + ' selected');
		} else if (elem_checked.length == 0) {
			button_span.html('All');
		}
	});
});

var ts_fs_genre_item = {
	"element": null,
	"valid_values": [],
	"exclusion_enabled": true,
};

ts_fs_genre_item.setValueCycles = function(){
	if ("ts_sf_exclusion" in window){
		if (ts_sf_exclusion){
			this.exclusion_enabled = true;
		}else{
			this.exclusion_enabled = false;
		}
	}
	if ( ! this.exclusion_enabled){
		this.valid_values = ["", "include"];
	}else{
		this.valid_values = ["", "include", "exclude"];
	}
}

ts_fs_genre_item.handle = function(element){
	this.element = jQuery(element);
	var next_value = this.get_next_value();
	this.element.attr('data-value', next_value);

	this.removeClassess();

	if (next_value == "include"){
		this.element.addClass("include");
		this.element.parent().addClass("include");
	}else if (next_value == "exclude"){
		this.element.addClass("exclude");
		this.element.parent().addClass("exclude");
	}else{

	}

	if (next_value != ""){
		this.element.prop("checked", true);
	}

	
	if (next_value == "exclude"){
		var current_input_value = this.get_input_value();
		var new_input_value = "-" + current_input_value;
		this.set_input_value(new_input_value);
	}

	this.set_title();
}
ts_fs_genre_item.removeClassess = function(){
	this.element.removeClass("include");
	this.element.removeClass("exclude");
	this.element.parent().removeClass("include");
	this.element.parent().removeClass("exclude");
}
ts_fs_genre_item.get_current_value = function(){
	var value = this.element.attr("data-value");
	if ( ! value) value = "";
	if (this.valid_values.indexOf(value) === -1) return "";
	return value;
}
ts_fs_genre_item.get_current_value_index = function(){
	var value = this.get_current_value();
	return this.valid_values.indexOf(value);
}
ts_fs_genre_item.get_next_value = function(){
	var current_value_index = this.get_current_value_index();
	var next_index = current_value_index+1;
	if (next_index >= this.valid_values.length) return this.valid_values[0];
	return this.valid_values[next_index];
}
ts_fs_genre_item.get_input_value = function(){
	return (this.element.val()+"").replace("-", "");
}
ts_fs_genre_item.set_input_value = function(val){
	this.element.val(val);
}
ts_fs_genre_item.set_title = function(){
	var ul_elem = jQuery("ul.genrez");
	var elem_included = ul_elem.find("input.include:checked");
	var elem_excluded = ul_elem.find("input.exclude:checked");
	var elem_checked = ul_elem.find("input:checked");
	var button_span = ul_elem.parent().find("button span");

	if (elem_included.length < 1 && elem_excluded.length > 1){
		button_span.html(elem_excluded.length + " excluded");
	}else if (elem_checked.length == 1) {
		button_span.html(elem_checked.parent().find("label").html());
	} else if (elem_checked.length > 1) {
		button_span.html(elem_checked.length + ' selected');
	} else if (elem_checked.length == 0) {
		button_span.html('All');
	}
}
jQuery(document).ready(function(){
	ts_fs_genre_item.setValueCycles();
	ts_fs_genre_item.set_title();
});