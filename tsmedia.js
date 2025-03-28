function tsMedia(x) {
  if (x.matches) {
    jQuery("#titlemove").appendTo(jQuery("#mobiletitle"));
  } else {
  	jQuery("#titlemove").prependTo(jQuery("#titledesktop"));
  }	
}
var tsmmedia = matchMedia("(max-width: 800px)");
if ("addEventListener" in tsmmedia){
  tsmmedia.addEventListener("change", tsMedia);
}else{
  tsmmedia.addListener(tsMedia);
}